def calculate_compression_needs(
    target_context_seconds: float,
    model_context_size: int,
    sample_rate: int = 16000
) -> float:
    samples_needed = target_context_seconds * sample_rate
    compression_ratio = samples_needed / model_context_size
    return compression_ratio

print("Compression ratios needed to fit X seconds into a 2048-token context:\n")

for target_seconds in [1, 5, 10, 30, 60]:
    ratio = calculate_compression_needs(
        target_context_seconds=target_seconds,
        model_context_size=2048
    )
    print(f"  {target_seconds:>2}s of audio → {ratio:>6.1f}x compression needed")

print("\n💡 Neural audio codecs like Mimi achieve ~128x compression!")
print("   This means 2048 tokens can represent ~16 seconds of audio.")