import re


def snake_to_camel(name: str) -> str:
    head, *rest = name.split("_")
    return head + "".join(p.title() for p in rest)


def camel_to_snake(name: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


def reading_time(text: str) -> str:
    words = len(text.split())
    return f"{max(1, round(words / 200))} min"
