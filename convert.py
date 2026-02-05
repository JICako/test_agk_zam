import json
import re

law = int(input("Число закона: "))

# читаем файл построчно и убираем пустые строки
with open("questions.txt", "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f if line.strip()]

result = []
current = None

for line in lines:

    # если строка начинается с числа и точки → это новый вопрос
    if re.match(r"^\d+\.", line):

        # если предыдущий вопрос уже собирали — сохраняем
        if current:
            result.append(current)

        # создаём новый объект вопроса
        current = {
            "law": law,
            "question": line,
            "correctAnswer": None,
            "incorrectAnswer": []
        }

    # если строка — вариант ответа (A) или A.)
    elif re.match(r"^[A-D][\)\.]", line):

        # по твоей логике — правильный всегда A
        if re.match(r"^A[\)\.]", line):
            current["correctAnswer"] = line
        else:
            current["incorrectAnswer"].append(line)

# не забываем последний вопрос
if current:
    result.append(current)

# сохраняем в json
with open("questions.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("Готово, блядь.")
