import torch
import torchaudio
import matplotlib.pyplot as plt

sample_rate = 16000
duration_seconds = 10

t = torch.linspace(0, duration_seconds, sample_rate * duration_seconds)
audio = torch.sin(2 * torch.pi * 200 * t) * torch.sin(2 * torch.pi * 3 * t)

print(f"Audio duration: {duration_seconds} seconds")
print(f"Sample rate: {sample_rate} Hz")
print(f"Total samples: {len(audio):,}")
print(f"Samples per second: {sample_rate:,}")

text = "The quick brown fox jumps over the lazy dog"
text_chars = len(text)
text_tokens_approx = len(text.split())

words = len(text.split())
audio_duration = words * 0.5
audio_samples = int(audio_duration * sample_rate)

print("Text representation:")
print(f"  Characters: {text_chars}")
print(f"  Words (≈ tokens): {text_tokens_approx}")

print("\nAudio representation (16kHz):")
print(f"  Duration: {audio_duration} seconds")
print(f"  Samples: {audio_samples:,}")

print(f"\nRatio: {audio_samples / text_tokens_approx:.0f}x more values in audio than text tokens")

context_sizes = {
    "GPT-2 small": 1024,
    "GPT-2 medium": 2048,
    "Modern LLMs": 8192,
}

sample_rate = 16000

print("How much audio fits in different context windows?\n")
print(f"{'Model':<20} {'Context':<10} {'Audio Duration':<15} {'Approx Words':<15}")
print("-" * 60)

for model, ctx in context_sizes.items():
    duration_ms = (ctx / sample_rate) * 1000
    approx_words = duration_ms / 500
    print(f"{model:<20} {ctx:<10} {duration_ms:.0f}ms{'':<10} ~{approx_words:.1f} words")

print("\n⚠️  With sample-by-sample modelling, even 8k context only covers ~0.5 seconds!")
print("   That's not even enough for a complete sentence.")

def simulate_context_window(audio, context_size, sample_rate):
    duration_visible = context_size / sample_rate
    samples_visible = min(context_size, len(audio))
    return audio[:samples_visible], duration_visible

sample_rate = 16000
full_audio = torch.randn(5 * sample_rate)

context_size = 2048
visible_audio, visible_duration = simulate_context_window(
    full_audio, context_size, sample_rate
)

print(f"Full audio: {len(full_audio)/sample_rate:.1f} seconds ({len(full_audio):,} samples)")
print(f"Model sees: {visible_duration*1000:.0f}ms ({len(visible_audio):,} samples)")
print(f"Model is blind to: {100 * (1 - len(visible_audio)/len(full_audio)):.1f}% of the audio")