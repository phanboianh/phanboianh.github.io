#!/bin/zsh
# Bấm đúp file này để đưa những gì vừa sửa lên web https://phanboianh.github.io
# (lưu thay đổi bằng git rồi đẩy lên GitHub; khoảng 1–2 phút sau web tự cập nhật)
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:$PATH"

echo "Đang kiểm tra thay đổi…"
git add -A
if git diff --cached --quiet; then
  echo "Không có gì mới để đăng — web đang là bản mới nhất."
else
  git commit -q -m "Cập nhật nội dung $(date '+%d/%m/%Y %H:%M')" || { echo "❌ Không lưu được thay đổi."; read -k1 "?Bấm phím bất kỳ để đóng…"; exit 1; }
  if git push -q; then
    echo "✅ Đã đăng lên mạng. Đợi 1–2 phút rồi mở https://phanboianh.github.io (bấm ⌘ R để tải lại)."
  else
    echo "❌ Chưa đẩy lên GitHub được. Kiểm tra mạng, hoặc chạy lại lệnh: gh auth login"
  fi
fi
echo
read -k1 "?Bấm phím bất kỳ để đóng cửa sổ này…"
