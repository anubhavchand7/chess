import struct

def create_chess_ico(filepath):
    # Create a 32x32 32-bit RGBA icon
    width = 32
    height = 32

    # Draw a stylized chess king/knight icon
    # 32x32 RGBA pixels
    pixels = bytearray(width * height * 4)

    # Gradient background with rounded square
    for y in range(height):
        for x in range(width):
            idx = ((height - 1 - y) * width + x) * 4 # BMP stores bottom-to-top

            # Rounded box check
            dx = max(0, abs(x - 15.5) - 12)
            dy = max(0, abs(y - 15.5) - 12)
            dist_sq = dx*dx + dy*dy

            if dist_sq <= 4:
                # Inside rounded icon
                # Gradient from Indigo (99, 102, 241) to Emerald (16, 185, 129)
                factor = (x + y) / 64.0
                r = int(99 * (1 - factor) + 16 * factor)
                g = int(102 * (1 - factor) + 185 * factor)
                b = int(241 * (1 - factor) + 129 * factor)

                # Draw simplified chess king cross and crown in white
                # Center cross (x: 14-17, y: 5-11)
                is_cross = (14 <= x <= 17 and 5 <= y <= 11) or (12 <= x <= 19 and 7 <= y <= 8)
                # Crown shape (y: 12-18)
                is_crown = (10 <= x <= 21 and 12 <= y <= 16 and (x in (10, 11, 15, 16, 20, 21) or y >= 15))
                # Base (y: 19-25)
                is_body = (11 <= x <= 20 and 17 <= y <= 22)
                is_base = (8 <= x <= 23 and 23 <= y <= 25)

                if is_cross or is_crown or is_body or is_base:
                    # White piece
                    pixels[idx] = 255     # B
                    pixels[idx + 1] = 255 # G
                    pixels[idx + 2] = 255 # R
                    pixels[idx + 3] = 255 # A
                else:
                    pixels[idx] = b
                    pixels[idx + 1] = g
                    pixels[idx + 2] = r
                    pixels[idx + 3] = 255
            else:
                # Transparent
                pixels[idx] = 0
                pixels[idx + 1] = 0
                pixels[idx + 2] = 0
                pixels[idx + 3] = 0

    # BITMAPINFOHEADER (40 bytes)
    # For ICO, biHeight is 2 * height (including 1-bit AND mask)
    bih = struct.pack(
        '<IIIHHIIIIII',
        40, width, height * 2, 1, 32, 0,
        len(pixels), 0, 0, 0, 0
    )

    # 1-bit AND mask (32 rows * 4 bytes per row = 128 bytes of zeros)
    and_mask = bytearray(height * ((width + 31) // 32) * 4)

    image_data = bih + pixels + and_mask

    # ICONDIR (6 bytes)
    icondir = struct.pack('<HHH', 0, 1, 1)

    # ICONDIRENTRY (16 bytes)
    iconentry = struct.pack(
        '<BBBBHHII',
        width, height, 0, 0, 1, 32, len(image_data), 6 + 16
    )

    with open(filepath, 'wb') as f:
        f.write(icondir + iconentry + image_data)

if __name__ == '__main__':
    create_chess_ico('chess.ico')
    print("chess.ico created successfully!")
