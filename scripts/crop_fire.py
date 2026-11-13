from PIL import Image

CX, CY, R = 737, 875, 300   # fire area (38.73 N, 112.50 W)

for name in ["fire_before", "fire_after"]:
    img = Image.open(f"website/images/{name}.png")
    crop = img.crop((CX - R, CY - R, CX + R, CY + R))
    crop.save(f"website/images/{name}_crop.png")
    print("saved", f"website/images/{name}_crop.png", crop.size)
