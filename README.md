# 🎮 Pixel Adventure Web (2D Platformer)

Dự án game 2D Platformer phong cách pixel retro được xây dựng theo kiến trúc chuẩn Backend - Frontend, mô phỏng chính xác 100% hai bản đồ mẫu từ bộ asset **Pixel Adventure 1**.

---

## 🏗️ Cấu trúc hệ thống (BE - FE Standard Structure)

```
DoAnDang/
├── backend/                  # BACKEND (FastAPI - Python)
│   ├── app/
│   │   ├── config.py         # Cấu hình server, đường dẫn tĩnh
│   │   ├── main.py           # Entrypoint FastAPI, CORS, static mounts
│   │   ├── models/
│   │   │   └── schemas.py    # Pydantic schemas (Level, Trap, Score, Leaderboard)
│   │   ├── routes/
│   │   │   ├── levels.py     # API cung cấp dữ liệu màn chơi & nhân vật
│   │   │   └── scores.py     # API lưu trữ điểm số & bảng xếp hạng
│   │   └── data/
│   │       ├── level1.json   # Dữ liệu vật lý & đối tượng Map 1
│   │       └── level2.json   # Dữ liệu vật lý & đối tượng Map 2
│   ├── requirements.txt
│   └── run.py                # Script chạy server backend
│
├── frontend/                 # FRONTEND (HTML5 / CSS3 / Vanilla JS Modular)
│   ├── index.html            # Khung giao diện web, HUD, canvas 512x288
│   ├── css/
│   │   └── style.css         # Pixel-art arcade theme, responsive container
│   ├── js/
│   │   ├── audio.js          # Bộ phát âm thanh 8-bit chip bằng Web Audio API
│   │   ├── input.js          # Xử lý sự kiện bàn phím & nút cảm ứng
│   │   ├── sprites.js        # Trình quản lý spritesheet & frame animation
│   │   ├── physics.js        # Engine va chạm AABB, solid, one-way platform
│   │   ├── player.js         # State machine nhân vật (Idle, Run, Jump, Wall Jump...)
│   │   ├── entities.js       # Quả ăn điểm (17 frame), Bẫy cưa quay, Cầu sụt lún
│   │   ├── level.js          # Controller nạp map từ API, quản lý thực thể
│   │   └── main.js           # Game loop (delta time), nút điều khiển, HUD
│   └── assets/
│       └── maps/
│           ├── map1_clean.png  # Nền sạch Map 1 (The Sawmill)
│           └── map2_clean.png  # Nền sạch Map 2 (Falling Bridges)
│
└── Pixel Adventure 1/        # Kho tài nguyên gốc (175 sprite & spritesheet)
```

---

## 🕹️ Phân tích nghiệp vụ 2 Bản đồ (Maps Analysis)

### 🗺️ Map 1: The Sawmill
- **Theme & Nhân vật:** Background kẻ caro xám (`Gray.png`), nhân vật chính là **Virtual Guy** (bộ đồ xanh, kính bảo hộ).
- **Vật phẩm:**
  - 7 quả Cam (`Orange`) xếp thành vòng cung phía trên khối đá lơ lửng.
  - 8 quả Táo (`Apple`) xếp thẳng hàng dưới đường cưa phía bên phải.
- **Cạm bẫy:**
  - 1 lưỡi cưa di chuyển dọc trượt trên xích thả từ trần nhà.
  - 1 lưỡi cưa di chuyển ngang trượt trên dây xích không trung.
  - 2 lưỡi cưa quay quanh 2 góc của khối bục ở trung tâm.
- **Cơ chế di chuyển:** Các bục gỗ mỏng 1 chiều gắn trên vách đá trái và chân cột trụ phải (nhảy xuyên từ dưới lên, ấn `S` + `Nhảy` để rơi xuống).

### 🗺️ Map 2: Falling Bridges
- **Theme & Nhân vật:** Background zíc-zắc nâu (`Brown.png`), nhân vật chính là **Mask Dude** (mặt nạ thổ dân gắn lông vũ).
- **Vật phẩm:** 13 loại trái cây nhiệt đới xếp thành 2 tầng cung:
  - Hàng trên (6 quả): Chuối, Dứa, Kiwi, Dưa hấu, Dâu tây, Cherry.
  - Hàng dưới (7 quả): Dứa, Táo, Cherry, Chuối, Cam, Dứa, Táo.
- **Cơ chế bẫy:** 4 bục rơi tự do (`Falling Platforms` sọc vàng đen). Khi người chơi bước lên:
  - Bục rung lắc cảnh báo trong 0.4 giây.
  - Rơi xuống vực.
  - Tự động hồi sinh trở lại vị trí cũ sau 2.5 giây.

---

## 🎮 Hướng dẫn điều khiển (Controls)

| Phím bấm | Thao tác nghiệp vụ |
| :--- | :--- |
| `A` / `D` hoặc `◀` / `▶` | Di chuyển trái / phải (có gia tốc mượt mà) |
| `W` / `Space` hoặc `▲` | Nhảy (nhấp giữ để nhảy cao, thả để cắt lực nhảy) |
| Nhảy lần 2 trên không | **Double Jump** (nhào lộn 2 vòng) |
| Trượt tường + `Space` | **Wall Slide & Wall Jump** (đạp tường nhảy ngược hướng) |
| `S` + `Space` | Rơi xuyên qua bục gỗ mỏng 1 chiều (`One-Way Platform`) |
| `R` hoặc nút 🔄 góc phải | Chơi lại màn hiện tại (`Restart`) |
| `N` hoặc nút ⏭ góc phải | Chuyển sang màn tiếp theo (`Next Level`) |
| `P` hoặc nút ⏮ góc phải | Quay về màn trước (`Prev Level`) |
| `M` | Bật / tắt âm thanh (`Mute Sound`) |

---

## 🚀 Cách khởi chạy ứng dụng

### Cách 1: Khởi chạy nhanh bằng 1 click (Khuyên dùng trên Windows)
- Nhấp đúp chuột vào file **`run.bat`** ở thư mục gốc của dự án.
- Script sẽ tự động kiểm tra môi trường Python, tự cài đặt thư viện nếu còn thiếu, khởi động server và tự động mở trình duyệt web tại `http://127.0.0.1:2222`.

---

### Cách 2: Khởi chạy thủ công bằng dòng lệnh

1. **Cài đặt thư viện:**
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Chạy server Backend:**
   ```bash
   python backend/run.py
   ```
   *Server sẽ khởi động tại: `http://127.0.0.1:2222`*

3. **Mở trình duyệt:**
   Truy cập `http://127.0.0.1:2222` để trải nghiệm trực tiếp game trên web!
