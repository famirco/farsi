import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding restructured database with roles...");

  // Clear existing data
  await prisma.question.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.level.deleteMany({});
  await prisma.term.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create admin user
  await prisma.user.create({
    data: {
      username: "admin",
      password: "admin",
      role: "ADMIN",
      accountType: "ADULT_HERITAGE",
    },
  });

  // 2. Create student user (Adult Heritage)
  const student = await prisma.user.create({
    data: {
      username: "student",
      password: "student",
      role: "USER",
      accountType: "ADULT_HERITAGE",
      whyLearning: "I want to talk comfortably with my grandmother and read her letters.",
      xp: 240,
      streak: 24,
      skills: JSON.stringify({
        listening: 85,
        speaking: 60,
        reading: 30,
        writing: 15,
      }),
    },
  });

  // 3. Create parent user (Sara)
  const parent = await prisma.user.create({
    data: {
      username: "sara",
      password: "sara",
      role: "USER",
      accountType: "PARENT",
      xp: 0,
      streak: 0,
    },
  });

  // 4. Create child user (Nika) linked to Sara
  await prisma.user.create({
    data: {
      username: "nika",
      password: "nika",
      role: "USER",
      accountType: "CHILD",
      parentUserId: parent.id,
      xp: 180,
      streak: 7,
      skills: JSON.stringify({
        listening: 50,
        speaking: 40,
        reading: 10,
        writing: 5,
      }),
    },
  });

  console.log("Created test users with account types successfully.");

  // 5. Create Terms, Levels, and Lessons
  const term1 = await prisma.term.create({
    data: {
      order: 1,
      titleEn: "Term 1: Foundations",
      titleFa: "ترم ۱: پایه‌ها",
    },
  });

  const level1 = await prisma.level.create({
    data: {
      termId: term1.id,
      order: 1,
      titleEn: "Level 1: First Steps",
      titleFa: "سطح ۱: اولین قدم‌ها",
    },
  });

  const level2 = await prisma.level.create({
    data: {
      termId: term1.id,
      order: 2,
      titleEn: "Level 2: Express Yourself",
      titleFa: "سطح ۲: ابراز خود",
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      levelId: level1.id,
      order: 1,
      titleEn: "Greetings",
      titleFa: "سلام و احوالپرسی",
      descEn: "Learn how to say hello and ask how someone is.",
      descFa: "یادگیری سلام کردن و احوالپرسی ساده به زبان فارسی.",
      xpReward: 20,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        lessonId: lesson1.id,
        order: 1,
        type: "SELECT",
        promptEn: "Select the correct translation for 'Hello'",
        promptFa: "سلام",
        options: JSON.stringify(["Khodâhâfez (Goodbye)", "Salâm (Hello)", "Tashakkor (Thank you)", "Bale (Yes)"]),
        correctAnswer: "Salâm (Hello)",
      },
      {
        lessonId: lesson1.id,
        order: 2,
        type: "SELECT",
        promptEn: "Translate 'How are you?' (Formal)",
        promptFa: "حال شما چطور است؟",
        options: JSON.stringify(["Sobh bekheyr", "Khosh âmadid", "Hâle shomâ chetor ast?", "Shab bekheyr"]),
        correctAnswer: "Hâle shomâ chetor ast?",
      },
      {
        lessonId: lesson1.id,
        order: 3,
        type: "SPEAK",
        promptEn: "Say 'Hello' out loud in Persian:",
        promptFa: "سلام",
        correctAnswer: "سلام",
      },
      {
        lessonId: lesson1.id,
        order: 4,
        type: "SPEAK",
        promptEn: "Say 'How are you?' out loud in Persian:",
        promptFa: "حال شما چطور است",
        correctAnswer: "حال شما چطور است",
      },
      {
        lessonId: lesson1.id,
        order: 5,
        type: "LISTEN_IMAGE",
        promptEn: "Listen and select the matching image:",
        promptFa: "سلام",
        options: JSON.stringify([
          "/images/hello_greeting.png",
          "/images/sleeping_night.png",
          "/images/eating_food.png",
          "/images/driving_car.png"
        ]),
        correctAnswer: "/images/hello_greeting.png",
      },
      {
        lessonId: lesson1.id,
        order: 6,
        type: "STORY_ORDER",
        promptEn: "Listen to the tea making story and arrange the steps in correct sequence:",
        promptFa: "چای دم کردن روال خاص خود را دارد. ابتدا آب کتری را جوش آورده، چای خشک را در قوری می‌ریزیم، سپس با آب جوش دم کرده و در آخر در فنجان می‌ریزیم و میل می‌کنیم.",
        options: JSON.stringify([
          "/images/tea_step1.png",
          "/images/tea_step2.png",
          "/images/tea_step3.png",
          "/images/tea_step4.png"
        ]),
        correctAnswer: JSON.stringify([
          "/images/tea_step1.png",
          "/images/tea_step2.png",
          "/images/tea_step3.png",
          "/images/tea_step4.png"
        ]),
      },
    ],
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      levelId: level2.id,
      order: 1,
      titleEn: "Basic Expressions",
      titleFa: "عبارات کاربردی",
      descEn: "Learn to say yes, no, please, and thank you.",
      descFa: "یادگیری بله، خیر، لطفا و تشکر کردن به زبان فارسی.",
      xpReward: 20,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        lessonId: lesson2.id,
        order: 1,
        type: "SELECT",
        promptEn: "Select the correct translation for 'Thank you'",
        promptFa: "خیلی ممنون",
        options: JSON.stringify(["Khodâhâfez", "Bale", "Na", "Kheyli mamnun"]),
        correctAnswer: "Kheyli mamnun",
      },
      {
        lessonId: lesson2.id,
        order: 2,
        type: "SELECT",
        promptEn: "Translate 'Please'",
        promptFa: "لطفاً",
        options: JSON.stringify(["Lotfan", "Bale", "Khosh âmadid", "Khahesh mikonam"]),
        correctAnswer: "Lotfan",
      },
      {
        lessonId: lesson2.id,
        order: 3,
        type: "SPEAK",
        promptEn: "Say 'Thank you' out loud in Persian:",
        promptFa: "خیلی ممنون",
        correctAnswer: "خیلی ممنون",
      },
    ],
  });

  console.log("Restructured database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
