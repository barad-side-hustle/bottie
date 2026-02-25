import type { ToneOfVoice } from "@/lib/types";

export type DemoConcreteLanguage = "english" | "hebrew" | "spanish";
export type DemoLanguage = "auto-detect" | DemoConcreteLanguage;

export interface DemoReview {
  id: string;
  name: string;
  rating: 1 | 3 | 5;
  text: string;
  date: string;
}

const reviews: Record<DemoConcreteLanguage, DemoReview[]> = {
  english: [
    {
      id: "demo-5",
      name: "Yuki T.",
      rating: 5,
      text: "Amazing experience! The food was incredible and the staff was so welcoming. We'll definitely be back!",
      date: "2025-12-15",
    },
    {
      id: "demo-3",
      name: "Priya S.",
      rating: 3,
      text: "Food was decent but the wait time was too long. Nice ambiance though.",
      date: "2025-12-10",
    },
    {
      id: "demo-1",
      name: "Mateo R.",
      rating: 1,
      text: "Very disappointed. Cold food and rude staff. Won't be coming back.",
      date: "2025-12-08",
    },
  ],
  hebrew: [
    {
      id: "demo-5",
      name: "יוקי ט.",
      rating: 5,
      text: "חוויה מדהימה! האוכל היה מעולה והצוות היה מקסים. בהחלט נחזור!",
      date: "2025-12-15",
    },
    {
      id: "demo-3",
      name: "פריה ס.",
      rating: 3,
      text: "האוכל היה סביר אבל ההמתנה הייתה ארוכה מדי. אווירה נחמדה.",
      date: "2025-12-10",
    },
    {
      id: "demo-1",
      name: "מתאו ר.",
      rating: 1,
      text: "מאוד מאוכזב. אוכל קר וצוות גס. לא נחזור.",
      date: "2025-12-08",
    },
  ],
  spanish: [
    {
      id: "demo-5",
      name: "Yuki T.",
      rating: 5,
      text: "Una experiencia increible! La comida fue espectacular y el personal muy amable. Volveremos seguro!",
      date: "2025-12-15",
    },
    {
      id: "demo-3",
      name: "Priya S.",
      rating: 3,
      text: "La comida estaba bien pero la espera fue demasiado larga. Buen ambiente.",
      date: "2025-12-10",
    },
    {
      id: "demo-1",
      name: "Mateo R.",
      rating: 1,
      text: "Muy decepcionada. Comida fria y personal grosero. No volveremos.",
      date: "2025-12-08",
    },
  ],
};

const responses: Record<DemoConcreteLanguage, Record<ToneOfVoice, Record<number, string[]>>> = {
  english: {
    professional: {
      5: [
        "Thank you for your wonderful review, Yuki. We are delighted to hear that both the food and service met your expectations. We look forward to welcoming you back soon.",
        "We sincerely appreciate your kind words and generous rating. It is gratifying to know our team delivered an excellent experience. We hope to serve you again in the near future.",
      ],
      3: [
        "Thank you for taking the time to share your feedback, Priya. We appreciate your positive comments about the ambiance and acknowledge the wait time concern. We are actively working to improve our service speed.",
        "We value your honest review and take your feedback seriously. Our team is addressing the wait time issue to ensure a better experience. We hope to exceed your expectations on your next visit.",
      ],
      1: [
        "Thank you for bringing these concerns to our attention, Mateo. We sincerely apologize for the experience you described and take this matter seriously. Please contact us directly so we can make this right.",
        "We are sorry to hear about your disappointing experience. This does not reflect the standards we uphold and we are investigating the issues you raised. We would welcome the opportunity to resolve this personally.",
      ],
    },
    friendly: {
      5: [
        "Wow, thank you so much, Yuki! We're thrilled you had such a great time with us. Can't wait to see you again soon!",
        "Thanks a ton for the lovely review, Yuki! It means the world to us that you enjoyed everything. Hope to see you back real soon!",
      ],
      3: [
        "Hey Priya, thanks for the honest feedback! We totally get it about the wait time and we're working on it. Glad you liked the vibe though!",
        "Thanks for sharing your thoughts, Priya! We hear you on the wait and we're making changes. Hope to wow you next time around!",
      ],
      1: [
        "Hey Mateo, we're really sorry about your experience. That's definitely not what we aim for and we want to make it up to you. Reach out to us and let's fix this!",
        "Oh no, Mateo! We're so sorry to hear this. We dropped the ball and we own that completely. Please give us a chance to make things right!",
      ],
    },
    formal: {
      5: [
        "We extend our heartfelt gratitude for your gracious review, Yuki. It is an honour to learn that our cuisine and hospitality have earned your commendation. We shall eagerly anticipate the pleasure of your return.",
        "Your most generous appraisal is deeply appreciated, Yuki. We are honoured that our establishment has provided you with such a distinguished experience. We respectfully look forward to serving you once more.",
      ],
      3: [
        "We are grateful for your candid assessment, Priya. Your observations regarding the waiting period are duly noted and shall be addressed forthwith. We trust that future visits will prove more satisfactory.",
        "We appreciate your considered review, Priya. The matter of service timing is one we are committed to rectifying with urgency. We remain hopeful of demonstrating marked improvement upon your return.",
      ],
      1: [
        "We deeply regret the unsatisfactory experience you have described, Mateo. Such occurrences are wholly unacceptable and contrary to our standards. We respectfully request the opportunity to address this matter in person.",
        "Please accept our sincerest apologies for the distressing experience, Mateo. We assure you that this matter shall receive our immediate and thorough attention. We humbly ask for the chance to restore your confidence.",
      ],
    },
    humorous: {
      5: [
        "Yuki, you just made our whole week! If our food were any more incredible, we'd need to put a warning label on it. See you next time, superstar!",
        "Five stars? Yuki, you're officially our favourite person today! We promise the food will be just as amazing next time. Pinky swear!",
      ],
      3: [
        "Priya, thanks for keeping it real! We know waiting isn't fun unless you're waiting for dessert. We're speeding things up so you can get to the good stuff faster!",
        "Three stars? Challenge accepted, Priya! We're putting our wait times on a strict diet. Next time, you'll barely have time to check your phone!",
      ],
      1: [
        "Yikes, Mateo, that sounds rough and we're not laughing. Cold food? Rude staff? That's definitely not our vibe. Let us make it up to you, no cold shoulders this time!",
        "Oh no, Mateo! We promise we're usually much cooler than this. Well, our food should be warmer, actually. Give us another shot and we'll show you the real us!",
      ],
    },
  },
  hebrew: {
    professional: {
      5: [
        "תודה רבה על הביקורת המצוינת, יוקי. אנו שמחים לשמוע שהאוכל והשירות עמדו בציפיות שלך. נשמח לארח אותך שוב בקרוב.",
        "אנו מעריכים את המילים החמות והדירוג הנדיב שלך. משמח לדעת שהצוות שלנו סיפק חוויה מעולה. מקווים לשרת אותך שוב בעתיד הקרוב.",
      ],
      3: [
        "תודה שהקדשת מזמנך לשתף את המשוב שלך, פריה. אנו מעריכים את ההערות החיוביות על האווירה ומכירים בבעיית ההמתנה. אנו עובדים באופן פעיל לשפר את מהירות השירות.",
        "אנו מעריכים את הביקורת הכנה שלך ומתייחסים למשוב שלך ברצינות. הצוות שלנו מטפל בנושא זמני ההמתנה כדי להבטיח חוויה טובה יותר. מקווים לעלות על הציפיות שלך בביקור הבא.",
      ],
      1: [
        "תודה שהבאת את החששות הללו לידיעתנו, מתאו. אנו מתנצלים באמת על החוויה שתיארת ומתייחסים לנושא ברצינות. אנא צור איתנו קשר ישירות כדי שנוכל לתקן את המצב.",
        "אנו מצטערים לשמוע על החוויה המאכזבת. זה לא משקף את הסטנדרטים שאנו שומרים עליהם ואנו בודקים את הבעיות שהעלית. נשמח להזדמנות לפתור זאת באופן אישי.",
      ],
    },
    friendly: {
      5: [
        "וואו, תודה רבה יוקי! אנחנו מאושרים שנהנית כל כך אצלנו. מחכים לראות אותך שוב בקרוב!",
        "תודה ענקית על הביקורת המדהימה, יוקי! זה אומר לנו המון שנהנית מהכל. מקווים לראות אותך שוב ממש בקרוב!",
      ],
      3: [
        "היי פריה, תודה על המשוב הכנה! אנחנו לגמרי מבינים לגבי ההמתנה ועובדים על זה. שמחים שאהבת את האווירה!",
        "תודה ששיתפת את המחשבות שלך, פריה! אנחנו שומעים אותך לגבי ההמתנה ומשפרים. מקווים להפתיע אותך בפעם הבאה!",
      ],
      1: [
        "היי מתאו, אנחנו ממש מצטערים על החוויה. זה בהחלט לא מה שאנחנו שואפים אליו ואנחנו רוצים לתקן. צור איתנו קשר ובוא נסדר את זה!",
        "אוי לא, מתאו! אנחנו כל כך מצטערים לשמוע. פישלנו ואנחנו לוקחים אחריות מלאה. תן לנו הזדמנות לתקן!",
      ],
    },
    formal: {
      5: [
        "הננו להודות לך מקרב לב על ביקורתך האדיבה, יוקי. זהו כבוד עבורנו לדעת שהמטבח והשירות זכו להערכתך. נצפה בשמחה לביקורך הבא.",
        "הערכתך הנדיבה מוערכת עמוקות, יוקי. אנו נכבדים שהמסעדה סיפקה לך חוויה ברמה גבוהה. נשמח לשרת אותך פעם נוספת.",
      ],
      3: [
        "אנו אסירי תודה על הערכתך הכנה, פריה. הערותיך בנוגע לזמן ההמתנה נלקחו בחשבון ויטופלו לאלתר. אנו בטוחים שביקורים עתידיים יוכיחו שיפור ניכר.",
        "אנו מעריכים את ביקורתך המושכלת, פריה. נושא מהירות השירות הוא עניין שאנו מחויבים לתקנו בדחיפות. נותרנו תקווה להפגין שיפור משמעותי בביקורך הבא.",
      ],
      1: [
        "אנו מצטערים עמוקות על החוויה הבלתי מספקת שתיארת, מתאו. מקרים שכאלה אינם מקובלים ונוגדים את הסטנדרטים שלנו. נבקש בכבוד את ההזדמנות לטפל בעניין באופן אישי.",
        "אנא קבל את התנצלותנו הכנה ביותר על החוויה המצערת, מתאו. אנו מבטיחים שעניין זה יקבל את תשומת הלב המיידית והמקיפה שלנו. נבקש בענווה את ההזדמנות לשקם את אמונך.",
      ],
    },
    humorous: {
      5: [
        "יוקי, את פשוט עשית לנו את כל השבוע! אם האוכל שלנו היה עוד יותר טוב, היינו צריכים לשים תווית אזהרה. נתראה בפעם הבאה, כוכבת!",
        "חמישה כוכבים? יוקי, את רשמית האדם האהוב עלינו היום! מבטיחים שהאוכל יהיה מדהים באותה מידה בפעם הבאה. הבטחה!",
      ],
      3: [
        "פריה, תודה שאת שומרת על זה אמיתי! אנחנו יודעים שהמתנה זה לא כיף, אלא אם מחכים לקינוח. אנחנו מזרזים כדי שתגיעי לדברים הטובים מהר יותר!",
        "שלושה כוכבים? אתגר התקבל, פריה! שמנו את זמני ההמתנה שלנו על דיאטה. בפעם הבאה, בקושי תספיקי לבדוק את הטלפון!",
      ],
      1: [
        "אואוצ', מתאו, זה נשמע קשה ואנחנו לא צוחקים. אוכל קר? צוות גס? זה ממש לא הווייב שלנו. תן לנו לתקן, הפעם בלי כתפיים קרות!",
        "אוי לא, מתאו! אנחנו מבטיחים שבדרך כלל אנחנו הרבה יותר אחלה. טוב, האוכל שלנו צריך להיות יותר חם, בעצם. תן לנו הזדמנות נוספת ונראה לך את האנחנו האמיתי!",
      ],
    },
  },
  spanish: {
    professional: {
      5: [
        "Gracias por su maravillosa resena, Yuki. Nos complace saber que tanto la comida como el servicio cumplieron con sus expectativas. Esperamos darle la bienvenida nuevamente pronto.",
        "Agradecemos sinceramente sus amables palabras y generosa calificacion. Es gratificante saber que nuestro equipo brindo una experiencia excelente. Esperamos servirle nuevamente en un futuro cercano.",
      ],
      3: [
        "Gracias por tomarse el tiempo de compartir sus comentarios, Priya. Apreciamos sus observaciones positivas sobre el ambiente y reconocemos la preocupacion sobre el tiempo de espera. Estamos trabajando activamente para mejorar la velocidad del servicio.",
        "Valoramos su resena honesta y tomamos sus comentarios en serio. Nuestro equipo esta abordando el problema del tiempo de espera para garantizar una mejor experiencia. Esperamos superar sus expectativas en su proxima visita.",
      ],
      1: [
        "Gracias por traer estas preocupaciones a nuestra atencion, Mateo. Nos disculpamos sinceramente por la experiencia que describio y tomamos este asunto con seriedad. Por favor contactenos directamente para poder resolver esto.",
        "Lamentamos escuchar sobre su experiencia decepcionante. Esto no refleja los estandares que mantenemos y estamos investigando los problemas que menciono. Agradeceriamos la oportunidad de resolver esto personalmente.",
      ],
    },
    friendly: {
      5: [
        "Guau, muchas gracias Yuki! Estamos encantados de que hayas pasado un rato tan genial con nosotros. No podemos esperar a verte de nuevo pronto!",
        "Mil gracias por la resena tan linda, Yuki! Significa muchisimo para nosotros que hayas disfrutado de todo. Esperamos verte de vuelta muy pronto!",
      ],
      3: [
        "Hola Priya, gracias por los comentarios honestos! Totalmente entendemos lo de la espera y estamos trabajando en ello. Que bueno que te gusto el ambiente!",
        "Gracias por compartir tus pensamientos, Priya! Te escuchamos sobre la espera y estamos mejorando. Esperamos sorprenderte la proxima vez!",
      ],
      1: [
        "Hola Mateo, estamos realmente apenados por tu experiencia. Definitivamente no es lo que buscamos y queremos compensarte. Contactanos y arreglemos esto!",
        "Ay no, Mateo! Estamos tan apenados de escuchar esto. La regamos y lo asumimos completamente. Danos la oportunidad de arreglarlo!",
      ],
    },
    formal: {
      5: [
        "Le extendemos nuestro mas sincero agradecimiento por su amable resena, Yuki. Es un honor saber que nuestra cocina y hospitalidad han merecido su elogio. Esperamos con anticipacion el placer de su regreso.",
        "Su generosa valoracion es profundamente apreciada, Yuki. Nos sentimos honrados de que nuestro establecimiento le haya brindado una experiencia tan distinguida. Respetuosamente esperamos servirle una vez mas.",
      ],
      3: [
        "Agradecemos su evaluacion sincera, Priya. Sus observaciones respecto al periodo de espera han sido debidamente anotadas y seran atendidas con prontitud. Confiamos en que futuras visitas resultaran mas satisfactorias.",
        "Apreciamos su resena considerada, Priya. El asunto de los tiempos de servicio es uno que nos comprometemos a rectificar con urgencia. Mantenemos la esperanza de demostrar una mejora notable en su proximo regreso.",
      ],
      1: [
        "Lamentamos profundamente la experiencia insatisfactoria que ha descrito, Mateo. Tales ocurrencias son completamente inaceptables y contrarias a nuestros estandares. Respetuosamente solicitamos la oportunidad de abordar este asunto en persona.",
        "Por favor acepte nuestras mas sinceras disculpas por la angustiante experiencia, Mateo. Le aseguramos que este asunto recibira nuestra atencion inmediata y exhaustiva. Humildemente pedimos la oportunidad de restaurar su confianza.",
      ],
    },
    humorous: {
      5: [
        "Yuki, nos acabas de alegrar toda la semana! Si nuestra comida fuera mas increible, tendriamos que ponerle una etiqueta de advertencia. Nos vemos la proxima, estrella!",
        "Cinco estrellas? Yuki, eres oficialmente nuestra persona favorita de hoy! Prometemos que la comida sera igual de increible la proxima vez. Palabra de honor!",
      ],
      3: [
        "Priya, gracias por ser honesta! Sabemos que esperar no es divertido a menos que sea por el postre. Estamos acelerando para que llegues a lo bueno mas rapido!",
        "Tres estrellas? Desafio aceptado, Priya! Pusimos nuestros tiempos de espera a dieta estricta. La proxima vez, apenas tendras tiempo de revisar tu telefono!",
      ],
      1: [
        "Uy, Mateo, eso suena feo y no nos estamos riendo. Comida fria? Personal grosero? Esa definitivamente no es nuestra onda. Dejanos compensarte, esta vez sin hombros frios!",
        "Ay no, Mateo! Prometemos que normalmente somos mucho mas geniales. Bueno, nuestra comida deberia ser mas caliente, la verdad. Danos otra oportunidad y te mostraremos como somos de verdad!",
      ],
    },
  },
};

export function getResponse(
  language: DemoConcreteLanguage,
  tone: ToneOfVoice,
  rating: number,
  variantIndex: number
): string {
  const variants = responses[language]?.[tone]?.[rating];
  if (!variants || variants.length === 0) return "";
  return variants[variantIndex % variants.length];
}

export function getReviews(language: DemoConcreteLanguage): DemoReview[] {
  return reviews[language] ?? reviews.english;
}
