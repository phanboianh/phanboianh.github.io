#!/usr/bin/env python3
"""Máy chủ nhỏ chạy NGAY TRÊN MÁY BẠN cho Trình chỉnh sửa portfolio.

- Mở website và trang chỉnh sửa ở http://127.0.0.1:<cổng>/
- Lưu nội dung vào noi-dung.js (bản cũ được sao lưu vào tools/sao-luu/)
- Nhận ảnh/video tải lên, tự thu nhỏ cho nhẹ web (ảnh bằng sips có sẵn trên Mac, video bằng ffmpeg nếu có)

Chỉ nghe ở 127.0.0.1 nên chỉ chính máy này truy cập được. Không cần Internet.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import unicodedata
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # thư mục portfolio-web
DATA = os.path.join(ROOT, 'noi-dung.js')
UPLOAD_DIR = os.path.join(ROOT, 'assets', 'tai-len')
BACKUP_DIR = os.path.join(ROOT, 'tools', 'sao-luu')
KEEP_BACKUPS = 30
LIMIT_VIDEO = 45 * 1024 * 1024  # video lớn hơn mức này sẽ được nén nhỏ thêm

IMAGE_EXT = {'.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.tif', '.tiff', '.gif'}
VIDEO_EXT = {'.mp4', '.mov', '.m4v', '.webm', '.mkv', '.avi'}
DOC_EXT = {'.pdf'}  # file CV để người xem tải về (giữ nguyên, không nén)

HEADER = (
    '// NỘI DUNG WEBSITE — file này do Trình chỉnh sửa tự ghi lại mỗi lần bấm "Lưu".\n'
    '// Có thể sửa tay, nhưng nhớ giữ nguyên dấu ngoặc kép "..." và dấu phẩy giữa các mục.\n'
)


def find_tool(name):
    """Tìm ffmpeg/ffprobe kể cả khi Terminal không nạp đường dẫn Homebrew."""
    for p in (shutil.which(name), f'/opt/homebrew/bin/{name}', f'/usr/local/bin/{name}'):
        if p and os.path.exists(p):
            return p
    return None


FFMPEG, FFPROBE = find_tool('ffmpeg'), find_tool('ffprobe')


def slug(filename):
    """'Ảnh Poster Mới.PNG' -> 'anh-poster-moi'"""
    base = os.path.splitext(os.path.basename(filename))[0]
    base = base.replace('đ', 'd').replace('Đ', 'D')
    base = unicodedata.normalize('NFKD', base).encode('ascii', 'ignore').decode()
    base = re.sub(r'[^a-zA-Z0-9]+', '-', base).strip('-').lower()
    return base[:60] or 'tep'


def unique_path(name, ext):
    """Không ghi đè file đã có: thêm -2, -3… nếu trùng tên."""
    path, n = os.path.join(UPLOAD_DIR, name + ext), 2
    while os.path.exists(path):
        path = os.path.join(UPLOAD_DIR, f'{name}-{n}{ext}')
        n += 1
    return path


def rel(path):
    return os.path.relpath(path, ROOT).replace(os.sep, '/')


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def image_size(path):
    out = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', path], capture_output=True, text=True).stdout
    w = re.search(r'pixelWidth: (\d+)', out)
    h = re.search(r'pixelHeight: (\d+)', out)
    return (int(w.group(1)), int(h.group(1))) if w and h else (0, 0)


def process_image(src, name, ext):
    """Thu nhỏ ảnh còn cạnh dài tối đa 2400px. PNG có nền trong suốt giữ nguyên PNG, còn lại đổi sang JPG."""
    if ext == '.gif':
        out = unique_path(name, '.gif')
        shutil.move(src, out)
    else:
        alpha = 'hasAlpha: yes' in subprocess.run(['sips', '-g', 'hasAlpha', src], capture_output=True, text=True).stdout
        keep_png = ext == '.png' and alpha
        out = unique_path(name, '.png' if keep_png else '.jpg')
        cmd = ['sips'] + (['-Z', '2400'] if max(image_size(src)) > 2400 else [])  # chỉ thu nhỏ, không phóng to
        cmd += ['-s', 'format', 'png'] if keep_png else ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82']
        run(cmd + [src, '--out', out])
        os.remove(src)
    w, h = image_size(out)
    return {'ok': True, 'loai': 'anh', 'duongDan': rel(out), 'rong': w, 'cao': h}


def duration_text(path):
    if not FFPROBE:
        return ''
    out = subprocess.run([FFPROBE, '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                         capture_output=True, text=True).stdout.strip()
    try:
        s = round(float(out))
    except ValueError:
        return ''
    return f'{s // 60:02d}:{s % 60:02d}'


def process_video(src, name, ext):
    """Nén video cho web (H.264, rộng tối đa 1920px) + tạo bản xem trước 8 giây không tiếng + ảnh bìa."""
    if not FFMPEG:
        # Không có ffmpeg: giữ nguyên file (nên dùng .mp4 để mọi trình duyệt phát được)
        out = unique_path(name, ext)
        shutil.move(src, out)
        return {'ok': True, 'loai': 'video', 'video': rel(out), 'xemTruoc': '', 'anhBia': '', 'thoiLuong': '',
                'canhBao': 'Máy chưa có ffmpeg nên video được giữ nguyên, không nén.'}
    out = unique_path(name, '.mp4')
    base = os.path.splitext(out)[0]
    prev, poster = base + '-xem-truoc.mp4', base + '-bia.jpg'
    x264 = ['-c:v', 'libx264', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
    run([FFMPEG, '-y', '-i', src, '-vf', "scale='trunc(min(1920,iw)/2)*2':-2", *x264, '-crf', '23',
         '-c:a', 'aac', '-b:a', '160k', out])
    # GitHub không nhận file trên 100 MB, và video nặng thì web tải chậm:
    # video dài làm nhỏ dần (720p, rồi nén mạnh hơn) cho tới khi dưới khoảng 45 MB
    for width, crf in (('1280', '25'), ('1280', '29'), ('960', '31')):
        if os.path.getsize(out) <= LIMIT_VIDEO:
            break
        run([FFMPEG, '-y', '-i', src, '-vf', f"scale='trunc(min({width},iw)/2)*2':-2", *x264, '-crf', crf,
             '-c:a', 'aac', '-b:a', '128k', out])
    os.remove(src)
    run([FFMPEG, '-y', '-t', '8', '-i', out, '-an', '-vf', "scale='trunc(min(960,iw)/2)*2':-2", *x264, '-crf', '27', prev])
    try:
        run([FFMPEG, '-y', '-ss', '1', '-i', out, '-frames:v', '1', '-q:v', '3', poster])
    except subprocess.CalledProcessError:  # video ngắn hơn 1 giây
        run([FFMPEG, '-y', '-i', out, '-frames:v', '1', '-q:v', '3', poster])
    return {'ok': True, 'loai': 'video', 'video': rel(out), 'xemTruoc': rel(prev), 'anhBia': rel(poster),
            'thoiLuong': duration_text(out)}


def save_data(data):
    if not isinstance(data, dict) or not isinstance(data.get('design'), list) or not isinstance(data.get('video'), list):
        raise ValueError('Dữ liệu không hợp lệ')
    os.makedirs(BACKUP_DIR, exist_ok=True)
    if os.path.exists(DATA):
        shutil.copy2(DATA, os.path.join(BACKUP_DIR, time.strftime('noi-dung-%Y%m%d-%H%M%S.js')))
        old = sorted(f for f in os.listdir(BACKUP_DIR) if f.startswith('noi-dung-'))
        for f in old[:-KEEP_BACKUPS]:
            os.remove(os.path.join(BACKUP_DIR, f))
    tmp = DATA + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as fh:
        fh.write(HEADER + 'window.PORTFOLIO = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n')
    os.replace(tmp, DATA)  # ghi xong mới thay, tránh hỏng file nếu bị ngắt giữa chừng


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass  # không in log từng yêu cầu cho đỡ rối mắt

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')  # luôn thấy nội dung mới nhất sau khi lưu
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    # ---- kiểm tra yêu cầu đến từ chính trang chỉnh sửa trên máy này ----
    def trusted(self):
        if self.headers.get('X-Portfolio') != '1':
            return False
        origin = self.headers.get('Origin')
        return origin is None or origin == f'http://{self.headers.get("Host")}'

    def reply(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if urlparse(self.path).path == '/api/ping':
            return self.reply(200, {'ok': True, 'ffmpeg': bool(FFMPEG)})
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        if rng and os.path.isfile(path):
            return self.send_range(path, rng)
        return super().do_GET()

    def send_range(self, path, rng):
        """Phát video theo từng đoạn (Safari cần cái này mới tua/phát được)."""
        size = os.path.getsize(path)
        m = re.match(r'bytes=(\d*)-(\d*)', rng)
        if not m or (not m.group(1) and not m.group(2)):
            return super().do_GET()
        if m.group(1):
            start, end = int(m.group(1)), int(m.group(2)) if m.group(2) else size - 1
        else:  # "bytes=-500" = 500 byte cuối
            start, end = max(0, size - int(m.group(2))), size - 1
        end = min(end, size - 1)
        if start > end:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            return self.end_headers()
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        with open(path, 'rb') as fh:
            fh.seek(start)
            left = end - start + 1
            try:
                while left > 0:
                    chunk = fh.read(min(1 << 20, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)
            except (BrokenPipeError, ConnectionResetError):
                pass  # trình duyệt tự ngắt khi tua, không sao

    def do_POST(self):
        url = urlparse(self.path)
        if not self.trusted():
            return self.reply(403, {'ok': False, 'loi': 'Không được phép'})
        length = int(self.headers.get('Content-Length') or 0)
        try:
            if url.path == '/api/luu':
                save_data(json.loads(self.rfile.read(length).decode('utf-8')))
                return self.reply(200, {'ok': True})
            if url.path == '/api/tai-len':
                return self.reply(200, self.receive_file(parse_qs(url.query).get('ten', ['tep'])[0], length))
        except subprocess.CalledProcessError as e:
            msg = (e.stderr or b'').decode(errors='ignore').strip().splitlines()
            return self.reply(500, {'ok': False, 'loi': 'Không xử lý được file này. ' + (msg[-1] if msg else '')})
        except Exception as e:  # báo lỗi rõ ràng cho trang chỉnh sửa
            return self.reply(500, {'ok': False, 'loi': str(e)})
        return self.reply(404, {'ok': False, 'loi': 'Không có chức năng này'})

    def receive_file(self, filename, length):
        ext = os.path.splitext(filename)[1].lower()
        if ext not in IMAGE_EXT | VIDEO_EXT | DOC_EXT:
            raise ValueError(f'Chưa hỗ trợ loại file {ext or "này"}. Dùng ảnh JPG/PNG/HEIC, video MP4/MOV hoặc file PDF.')
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        fd, tmp = tempfile.mkstemp(suffix=ext, dir=UPLOAD_DIR)
        with os.fdopen(fd, 'wb') as fh:
            left = length
            while left > 0:
                chunk = self.rfile.read(min(1 << 20, left))
                if not chunk:
                    break
                fh.write(chunk)
                left -= len(chunk)
        name = slug(filename)
        try:
            if ext in DOC_EXT:
                with open(tmp, 'rb') as fh:
                    if fh.read(5) != b'%PDF-':
                        raise ValueError('File này không phải PDF hợp lệ.')
                out = unique_path(name, '.pdf')
                shutil.move(tmp, out)
                warn = 'File PDF nặng hơn 20 MB, người xem sẽ tải lâu. Nên xuất lại bản nhẹ hơn.' if os.path.getsize(out) > 20 * 1024 * 1024 else ''
                return {'ok': True, 'loai': 'pdf', 'duongDan': rel(out), 'canhBao': warn}
            return process_image(tmp, name, ext) if ext in IMAGE_EXT else process_video(tmp, name, ext)
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)


def main():
    handler = partial(Handler, directory=ROOT)
    for port in range(4321, 4341):
        try:
            server = ThreadingHTTPServer(('127.0.0.1', port), handler)
            break
        except OSError:
            continue
    else:
        sys.exit('Không tìm được cổng trống (4321–4340).')
    url = f'http://127.0.0.1:{port}/chinh-sua.html'
    print('\n  ✅ Trình chỉnh sửa portfolio đang chạy')
    print(f'     Trang chỉnh sửa: {url}')
    print(f'     Xem website:     http://127.0.0.1:{port}/index.html')
    print('     ffmpeg (nén video):', 'có' if FFMPEG else 'KHÔNG có — video sẽ giữ nguyên, không nén')
    print('\n  Đừng đóng cửa sổ này khi đang chỉnh sửa.')
    print('  Làm xong: bấm Lưu trên trang, rồi đóng cửa sổ này (hoặc bấm Control + C).\n')
    if '--khong-mo' not in sys.argv:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  Đã tắt Trình chỉnh sửa.')


if __name__ == '__main__':
    main()
