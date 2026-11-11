import base64
from io import BytesIO
import socket
import qrcode


def get_lan_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def generate_qr_base64(content: str) -> str:
    """
    Generates a base64-encoded PNG image of a QR code.
    If content is a raw token, encodes a full reachable URL so phone cameras can open it.
    Returns: data:image/png;base64,<payload>
    """
    lan_ip = get_lan_ip()
    if not (content.startswith("http://") or content.startswith("https://")):
        payload = f"http://{lan_ip}:5175/?verify={content}"
    else:
        payload = content.replace("localhost", lan_ip).replace("127.0.0.1", lan_ip)

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=3,
    )
    qr.add_data(payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return f"data:image/png;base64,{b64_str}"
