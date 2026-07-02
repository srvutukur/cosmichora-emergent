"""One-off script: generate the mystical Vedic celestial hero image for Cosmic Hora.
Run: cd /app/backend && python generate_hero.py
Writes: /app/frontend/public/generated/hero-celestial.png
"""
import asyncio
import base64
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

from emergentintegrations.llm.chat import LlmChat, UserMessage

PROMPT = (
    "Ultra-luxurious editorial hero illustration for a premium Vedic astrology "
    "brand called 'Cosmic Hora'. Deep midnight-indigo and dark-plum night sky "
    "with soft nebulae and countless tiny stars. Centered composition: a large, "
    "intricate golden Sri Yantra sacred geometry overlaid with a subtle zodiac "
    "wheel — 12 zodiac symbols in a circular ring rendered in fine royal-gold "
    "line-work with a delicate saffron glow. Wisps of pale gold constellations "
    "and thin luminous lines connecting stars. A crescent moon and one prominent "
    "planet accent the upper right. Mystical, spiritual, meditative, editorial, "
    "high-end — the aesthetic of a modern spiritual magazine cover meets "
    "ancient Vedic manuscript. No text, no logos, no watermarks. Cinematic "
    "lighting with soft gold rim light, painterly shading, photorealistic detail "
    "on the geometry, dreamy soft-focus on the background nebula. 16:9 wide "
    "aspect. Rich, saturated but never garish. Extremely detailed sacred "
    "geometry. Museum-grade artistry."
)


async def main() -> None:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not set")
        sys.exit(1)

    chat = LlmChat(
        api_key=api_key,
        session_id="cosmic-hora-hero-v1",
        system_message="You are a world-class digital illustrator specialising in mystical, editorial celestial artwork.",
    )
    chat.with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])

    msg = UserMessage(text=PROMPT)
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"Text: {text[:140] if text else '(none)'}")
    print(f"Images: {len(images) if images else 0}")

    out = Path("/app/frontend/public/generated/hero-celestial.png")
    out.parent.mkdir(parents=True, exist_ok=True)

    if not images:
        print("ERROR: no images returned")
        sys.exit(2)

    image_bytes = base64.b64decode(images[0]["data"])
    out.write_bytes(image_bytes)
    print(f"OK → {out}  ({len(image_bytes)} bytes, mime={images[0].get('mime_type')})")


if __name__ == "__main__":
    asyncio.run(main())
