import cv2
import numpy as np


# save the output image (encoded image)
cv2.imwrite(output_image, encoded_image)
# decode the secret data from the image
decoded_data = decode(output_image)
# print("[+] Decoded data:", decoded_data)
print(msg)


print("The Decoded Message is : ")

print(decode("C:/Users/Anirudh/OneDrive/Desktop/ISM_Project/Steganography/pvd6_img.png"))
