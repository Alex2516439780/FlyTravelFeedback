document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');

    if (!form) {
        return;
    }
    const difficultiesYes = document.getElementById('difficultiesYes');
    const difficultiesDescription = document.getElementById('difficultiesDescription');
    const newsletterYes = document.getElementById('newsletterYes');
    const newsletterEmail = document.getElementById('newsletterEmail');

    // Переключение языков
    const langRu = document.getElementById('langRu');
    const langUz = document.getElementById('langUz');
    let currentLang = 'ru';

    function switchLanguage(lang) {
        currentLang = lang;
        const elements = document.querySelectorAll('[data-ru][data-uz]');

        elements.forEach(element => {
            if (lang === 'ru') {
                element.textContent = element.getAttribute('data-ru');
            } else {
                element.textContent = element.getAttribute('data-uz');
            }
        });

        // Переводим placeholder тексты
        const placeholderElements = document.querySelectorAll('[data-ru-placeholder][data-uz-placeholder]');
        placeholderElements.forEach(element => {
            if (lang === 'ru') {
                element.placeholder = element.getAttribute('data-ru-placeholder');
            } else {
                element.placeholder = element.getAttribute('data-uz-placeholder');
            }
        });

        // Обновляем активную кнопку
        if (lang === 'ru') {
            langRu.classList.add('active');
            langUz.classList.remove('active');
        } else {
            langUz.classList.add('active');
            langRu.classList.remove('active');
        }
    }

    if (langRu) {
        langRu.addEventListener('click', () => switchLanguage('ru'));
    }
    if (langUz) {
        langUz.addEventListener('click', () => switchLanguage('uz'));
    }

    // Показать/скрыть поле описания сложностей
    if (difficultiesYes) {
        difficultiesYes.addEventListener('change', () => {
            if (difficultiesYes.checked) {
                difficultiesDescription.style.display = 'block';
                difficultiesDescription.setAttribute('required', 'true');
            } else {
                difficultiesDescription.style.display = 'none';
                difficultiesDescription.removeAttribute('required');
                difficultiesDescription.value = ''; // Очищаем поле при скрытии
            }
        });
    }

    // Также обрабатываем выбор "Нет" для сложностей
    const difficultiesNo = document.getElementById('difficultiesNo');
    if (difficultiesNo) {
        difficultiesNo.addEventListener('change', () => {
            if (difficultiesNo.checked) {
                difficultiesDescription.style.display = 'none';
                difficultiesDescription.removeAttribute('required');
                difficultiesDescription.value = ''; // Очищаем поле при выборе "Нет"
            }
        });
    }

    // Показать/скрыть поле email для рассылки
    if (newsletterYes) {
        newsletterYes.addEventListener('change', () => {
            if (newsletterYes.checked) {
                newsletterEmail.style.display = 'block';
                newsletterEmail.setAttribute('required', 'true');
            } else {
                newsletterEmail.style.display = 'none';
                newsletterEmail.removeAttribute('required');
                newsletterEmail.value = ''; // Очищаем поле при скрытии
            }
        });
    }

    // Также обрабатываем выбор "Нет" для рассылки
    const newsletterNo = document.getElementById('newsletterNo');
    if (newsletterNo) {
        newsletterNo.addEventListener('change', () => {
            if (newsletterNo.checked) {
                newsletterEmail.style.display = 'none';
                newsletterEmail.removeAttribute('required');
                newsletterEmail.value = ''; // Очищаем поле при выборе "Нет"
            }
        });
    }

    // Обработчики для снятия подсветки ошибок с радиокнопок при выборе
    form.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            let parentElement = null;
            if (radio.closest('.rating-section')) {
                parentElement = radio.closest('table');
            } else {
                parentElement = radio.closest('.form-group');
            }
            if (parentElement && parentElement.classList.contains('error-highlight')) {
                parentElement.classList.remove('error-highlight');
            }
        });
    });

    // Функция валидации формы
    function validateForm() {
        let isValid = true;
        let firstInvalidElement = null;
        let errorMessage = currentLang === 'ru' ? 'Пожалуйста, заполните:' : 'Iltimos, toʻldiring:';

        // Удаляем все предыдущие подсветки ошибок
        document.querySelectorAll('.error-highlight').forEach(el => {
            el.classList.remove('error-highlight');
        });

        // Проверяем текстовые поля и текстовые области
        form.querySelectorAll('input[type="text"][required], input[type="date"][required], input[type="email"][required], textarea[required]').forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                const formGroup = input.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.add('error-highlight');
                    if (!firstInvalidElement) {
                        firstInvalidElement = formGroup;
                        const labelText = formGroup.querySelector('label') ? formGroup.querySelector('label').textContent : '';
                        errorMessage += `\n- ${labelText.replace(':', '').trim()}`;
                    }
                }
            }
        });

        // Проверяем группы радиокнопок
        const radioGroups = {};
        const requiredRadios = form.querySelectorAll('input[type="radio"][required]');

        // Собираем все группы, где есть хотя бы одна радиокнопка с required
        requiredRadios.forEach(radio => {
            const name = radio.name;
            if (!radioGroups[name]) {
                radioGroups[name] = [];
                // Добавляем ВСЕ радиокнопки этой группы, а не только с required
                const allRadiosInGroup = form.querySelectorAll(`input[type="radio"][name="${name}"]`);
                radioGroups[name] = Array.from(allRadiosInGroup);
            }
        });

        for (const name in radioGroups) {
            const group = radioGroups[name];
            const isAnyRadioChecked = group.some(radio => radio.checked);

            if (!isAnyRadioChecked) {
                isValid = false;
                let parentElement = null;
                let questionTitle = '';

                // Для радиогрупп, которые находятся в таблице (вопросы 2 и 3)
                if (group[0].closest('.rating-section')) {
                    parentElement = group[0].closest('table');
                    if (parentElement) {
                         // Находим заголовок h3 перед таблицей
                        const h3 = parentElement.previousElementSibling;
                        if (h3 && h3.tagName === 'H3') {
                            questionTitle = h3.textContent.trim();
                        } else { // Если h3 не найден, ищем p перед таблицей
                            const p = parentElement.previousElementSibling;
                            if (p && p.tagName === 'P') {
                                questionTitle = p.textContent.trim();
                            }
                        }
                    }
                } else { // Для радиогрупп вне таблицы (например, вопросы 4, 7, 8)
                    parentElement = group[0].closest('.form-group');
                    if (parentElement) {
                         // Находим заголовок h3 перед form-group
                        const h3 = parentElement.previousElementSibling;
                        if (h3 && h3.tagName === 'H3') {
                            questionTitle = h3.textContent.trim();
                        }
                    }
                }

                if (parentElement) {
                    parentElement.classList.add('error-highlight');
                    if (!firstInvalidElement) {
                        firstInvalidElement = parentElement;
                         if (questionTitle) {
                            errorMessage += `\n- ${questionTitle.replace(/\d+\.\s*/, '').trim()}`;
                        }
                    }
                }
            }
        }

        if (!isValid && firstInvalidElement) {
            alert(errorMessage);
            firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }

    // Функция отправки данных формы
    async function sendFormData() {
        const TOKEN = '8379599422:AAGV6kmeb40rUYxPMDhmW79_rfFidNq6T-Y';
        const CHAT_IDS = ['521500516', '1776985'];
        const SEND_MESSAGE_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

        // Формируем красивое текстовое сообщение
        const consultationRating = document.querySelector('input[name="consultation"]:checked') ? document.querySelector('input[name="consultation"]:checked').value : 'Не оценено';
        const professionalismRating = document.querySelector('input[name="professionalism"]:checked') ? document.querySelector('input[name="professionalism"]:checked').value : 'Не оценено';
        const convenienceRating = document.querySelector('input[name="convenience"]:checked') ? document.querySelector('input[name="convenience"]:checked').value : 'Не оценено';
        const informationRating = document.querySelector('input[name="information"]:checked') ? document.querySelector('input[name="information"]:checked').value : 'Не оценено';
        const responseSpeedRating = document.querySelector('input[name="responseSpeed"]:checked') ? document.querySelector('input[name="responseSpeed"]:checked').value : 'Не оценено';
        const transferRating = document.querySelector('input[name="transfer"]:checked') ? document.querySelector('input[name="transfer"]:checked').value : 'Не оценено';
        const accommodationRating = document.querySelector('input[name="accommodation"]:checked') ? document.querySelector('input[name="accommodation"]:checked').value : 'Не оценено';
        const cleanlinessRating = document.querySelector('input[name="cleanliness"]:checked') ? document.querySelector('input[name="cleanliness"]:checked').value : 'Не оценено';
        const foodRating = document.querySelector('input[name="food"]:checked') ? document.querySelector('input[name="food"]:checked').value : 'Не оценено';
        const excursionsRating = document.querySelector('input[name="excursions"]:checked') ? document.querySelector('input[name="excursions"]:checked').value : 'Не оценено';
        const guideRating = document.querySelector('input[name="guide"]:checked') ? document.querySelector('input[name="guide"]:checked').value : 'Не оценено';
        const difficulties = document.querySelector('input[name="difficulties"]:checked').value;
        const overallSatisfactionRating = document.querySelector('input[name="overallSatisfaction"]:checked').value;
        const recommendRating = document.querySelector('input[name="recommend"]:checked') ? document.querySelector('input[name="recommend"]:checked').value : 'Не оценено';
        const newsletter = document.querySelector('input[name="newsletter"]:checked') ? document.querySelector('input[name="newsletter"]:checked').value : 'Не оценено';

        // Переводы для сообщения
        const translations = {
            ru: {
                title: '📝 *ОТЗЫВ ПОСЛЕ ПОЕЗДКИ*',
                generalInfo: '*1. ОБЩАЯ ИНФОРМАЦИЯ*',
                name: '👤 Имя:',
                date: '📅 Дата:',
                destination: '🌍 Направление:',
                manager: '👨‍💼 Менеджер:',
                oksRating: '*2. ОЦЕНКА РАБОТЫ "OKS TOURS"*',
                consultation: '⭐ Консультация:',
                professionalism: '⭐ Профессионализм:',
                convenience: '⭐ Удобство оформления:',
                information: '⭐ Информация:',
                responseSpeed: '⭐ Скорость ответов:',
                tripRating: '*3. ОЦЕНКА ПОЕЗДКИ*',
                transfer: '🚌 Трансфер:',
                accommodation: '🏨 Проживание:',
                cleanliness: '✨ Чистота:',
                food: '🍽️ Питание:',
                excursions: '🎯 Экскурсии:',
                guide: '👨‍🏫 Гид:',
                difficulties: '*4. СЛОЖНОСТИ*',
                yes: 'Да',
                no: 'Нет',
                liked: '*5. ЧТО ПОНРАВИЛОСЬ*',
                improve: '*6. ЧТО УЛУЧШИТЬ*',
                satisfaction: '*7. УДОВЛЕТВОРЕННОСТЬ*',
                recommendations: '*8. РЕКОМЕНДАЦИИ*',
                newsletter: '*9. РАССЫЛКА*',
                notSpecified: 'Не указано',
                reviewDate: '📅 *Дата отзыва:'
            },
            uz: {
                title: '📝 *SAYOHTDAN KEYINGI SHARH*',
                generalInfo: '*1. UMUMIY MA\'LUMOT*',
                name: '👤 Ism:',
                date: '📅 Sana:',
                destination: '🌍 Yo\'nalish:',
                manager: '👨‍💼 Menejer:',
                oksRating: '*2. "OKS TOURS" FAOLIYATINI BAHOLANG*',
                consultation: '⭐ Menejerning maslahatlari:',
                professionalism: '⭐ Professionalizm va xushmuomalalik:',
                convenience: '⭐ Turni rasmiylashtirish qulayligi:',
                information: '⭐ Ma\'lumotning to\'liqligi va aniqligi:',
                responseSpeed: '⭐ Savol/javoblarga javob berish tezligi:',
                tripRating: '*3. SAFARINGIZNI BAHOLANG*',
                transfer: '🚌 Transfer tashkiloti:',
                accommodation: '🏨 Yashash joyi (otel/apartament):',
                cleanliness: '✨ Tozalik va qulaylik:',
                food: '🍽️ Ovqatlanish (agar kiritilgan bo\'lsa):',
                excursions: '🎯 Ekskursiyalar/tur dasturi:',
                guide: '👨‍🏫 Gid faoliyati (agar bo\'lgan bo\'lsa):',
                difficulties: '*4. QIYINCHILIKLAR*',
                yes: 'Ha',
                no: 'Yo\'q',
                liked: '*5. SIZGA ENG YOQQAN JIHATLAR NIMALAR EDI*',
                improve: '*6. SIZNINGCHA, NIMANI YAXSHILASH MUMKIN*',
                satisfaction: '*7. UMUMAN OLGANDA, SAYOHTINGIZDAN QANCHALIK MAMNUNSIZ*',
                recommendations: '*8. OKS TOURS KOMPANIYASINI DO\'STLARINGIZGA TAVSIYA QILASIZMI*',
                newsletter: '*9. BIZNING YANGI TURLAR VA MAXSUS TAKLIFLARIMIZ HAQIDA MA\'LUMOT OLISHNI ISTAYSIZMI*',
                notSpecified: 'Ko\'rsatilmagan',
                reviewDate: '📅 *Sharh sanasi:'
            }
        };

        const t = translations[currentLang];
        const newsletterEmailValue = newsletter === 'Да' ? document.getElementById('newsletterEmail').value : t.notSpecified;
        const message = `${t.title}

${t.generalInfo}
${t.name} ${document.getElementById('name').value || t.notSpecified}
${t.date} ${document.getElementById('travelDate').value}
${t.destination} ${document.getElementById('destination').value}
${t.manager} ${document.getElementById('managerName').value || t.notSpecified}

${t.oksRating}
${t.consultation} ${consultationRating}/5
${t.professionalism} ${professionalismRating}/5
${t.convenience} ${convenienceRating}/5
${t.information} ${informationRating}/5
${t.responseSpeed} ${responseSpeedRating}/5

${t.tripRating}
${t.transfer} ${transferRating}/5
${t.accommodation} ${accommodationRating}/5
${t.cleanliness} ${cleanlinessRating}/5
${t.food} ${foodRating}/5
${t.excursions} ${excursionsRating}/5
${t.guide} ${guideRating}/5

${t.difficulties}
${difficulties === 'Да' ? `⚠️ ${t.yes}: ${document.getElementById('difficultiesDescription').value}` : `✅ ${t.no}`}

${t.liked}
💬 ${document.getElementById('mostLiked').value || t.notSpecified}

${t.improve}
💭 ${document.getElementById('canBeImproved').value || t.notSpecified}

${t.satisfaction}
😊 ${overallSatisfactionRating}

${t.recommendations}
👥 ${recommendRating}

${t.newsletter}
${newsletter === 'Да' ? `✅ ${t.yes}: ${newsletterEmailValue}` : `❌ ${t.no}`}

${t.reviewDate} ${new Date().toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'uz-UZ')}*`;

        // Отправка текстового сообщения в Telegram во все чаты
        try {
            let allSuccessful = true;
            let errorMessages = [];

            for (const chatId of CHAT_IDS) {
                try {
                    const response = await fetch(SEND_MESSAGE_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: message,
                            parse_mode: 'Markdown'
                        })
                    });

                    const data = await response.json();
                    if (!data.ok) {
                        allSuccessful = false;
                        let errorMessage = 'Неизвестная ошибка';
                        if (data.description === 'Bad Request: chat not found') {
                            errorMessage = `❌ Ошибка для чата ${chatId}: Чат не найден. Убедитесь, что бот добавлен в группу/канал и CHAT_ID правильный.`;
                        } else if (data.description === 'Bad Request: bot was blocked by the user') {
                            errorMessage = `❌ Ошибка для чата ${chatId}: Бот заблокирован пользователем.`;
                        } else {
                            errorMessage = `❌ Ошибка для чата ${chatId}: ${data.description || 'Неизвестная ошибка'}`;
                        }
                        errorMessages.push(errorMessage);
                    }
                } catch (chatError) {
                    allSuccessful = false;
                    errorMessages.push(`❌ Сетевая ошибка для чата ${chatId}: ${chatError.message}`);
                }
            }

            if (allSuccessful) {
                showThankYouModal();
                form.reset();
            } else {
                alert(`Произошли ошибки при отправке:\n${errorMessages.join('\n')}`);
            }
        } catch (error) {
            alert('Произошла сетевая ошибка. Проверьте ваше подключение к интернету.');
        }
    }

    // Обработчик события отправки формы
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            await sendFormData();
        });
    }
});

// Функции для модального окна
function showThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('thankYouModal');
    modal.style.display = 'none';
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('thankYouModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
