import base64
from io import BytesIO
import qrcode


def generate_qr_base64(content: str) -> str:
    """
    Generates a base64-encoded PNG image of a QR code.
    Returns: data:image/png;base64,<payload>
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=3,
    )
    qr.add_data(content)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return f"data:image/png;base64,{b64_str}"
