import asyncio
import os
import edge_tts

# Audio texts to generate
audios = {
    "onboarding_test.mp3": "من امروز به خانه مادربزرگ می‌روم",
    "salam.mp3": "سلام",
    "hal_e_shoma.mp3": "حال شما چطور است",
    "kheyli_mamnun.mp3": "خیلی ممنون"
}

VOICE = "fa-IR-DilaraNeural"

async def amain() -> None:
    # Ensure public/audio directory exists
    os.makedirs("./public/audio", exist_ok=True)
    
    for filename, text in audios.items():
        filepath = os.path.join("./public/audio", filename)
        print(f"Generating: {text} -> {filepath}")
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(filepath)
    print("All audio files generated successfully!")

if __name__ == "__main__":
    asyncio.run(amain())
