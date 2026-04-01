// Personalize everything here.
// This file intentionally exposes config on window.CONTENT for simple static hosting.

window.CONTENT = {
  brand: {
    badgeText: "BirthdayQuest",
    title: "A tiny quest for your birthday",
  },

  gate: {
    passcodeLabel: "Enter passcode",
    passcodeHint: "Tip: something only you two would know.",
    passcode: "032026",
    successTitle: "Access granted",
    successText: "Okay. Let’s begin the quest.",
  },

  person: {
    name: "NKEM",
    from: "AWELEWA",
  },

  screens: {
    intro: {
      title: "Happy Birthday, {name}",
      subtitle:
        "Welcome to your birthday quest. It’s short, sweet, and slightly dramatic. You’ll unlock each screen to reach your final reward.",
      pills: ["7 screens", "1 reward", "100% you"],
      ctaText: "Start",
    },

    photos: {
      title: "Level 1: Our little album",
      subtitle: "Tap the card to go to the next photo.",
      cards: [
        { src: "./assets/photos/us-together.jpeg", alt: "Us together", caption: "Us, always." },
        { src: "./assets/photos/us-at-the-beach.jpeg", alt: "Us at the beach", caption: "Sun, sand, and you." },
        { src: "./assets/photos/datenight-2.jpeg", alt: "Date night", caption: "Date nights with you hit different." },
        { src: "./assets/photos/ituah.jpeg", alt: "Ituah", caption: "My favorite face." },
        {
          src: "./assets/photos/goofy-picture-of-us.jpeg",
          alt: "Goofy picture of us",
          caption: "Goofy us, because that’s us too.",
        },
      ],
    },

    note1: {
      title: "A note before the next level",
      body:
        "I’m grateful for you. For your laugh, your heart, and the way you make ordinary days feel like a win.",
      ctaText: "Continue",
    },

    level2: {
      title: "Level 2: Quick quiz",
      subtitle: "Answer at least {minCorrect} correctly to continue.",
      minCorrect: 2,
      questions: [
        {
          q: "What’s my favorite way to be loved?",
          choices: ["Quality time", "Gifts", "Acts of service", "All of the above"],
          correctIndex: 3,
        },
        {
          q: "Pick our vibe.",
          choices: ["Soft & sweet", "Chaotic & funny", "Power couple", "All of them"],
          correctIndex: 3,
        },
        {
          q: "What do I want you to do today?",
          choices: ["Smile", "Relax", "Eat good food", "All of the above"],
          correctIndex: 3,
        },
      ],
    },

    note2: {
      title: "Just so you know…",
      body:
        "I’m proud of you. I believe in you. And I’m always in your corner — today and every day.",
      ctaText: "Next",
    },

    level3: {
      title: "Level 3: The promise list",
      subtitle: "Tick all three to unlock the final screen.",
      items: [
        "I will receive birthday kisses without negotiation.",
        "I will enjoy my day without stress.",
        "I will remember I’m deeply loved (even when I’m being annoying).",
      ],
    },

    final: {
      title: "Final level: Your surprise",
      subtitle:
        "One step at a time: claim the playlist, watch the moments, let the code run, then open your voucher. (Reset starts you over.)",
      phaseSubtitleVideos: "Part 1 — watch (or skip ahead on the last clip). When you’re done, tap Continue.",
      phaseSubtitleCode: "Part 2 — let it compile. The next screen unlocks when it’s finished.",
      phaseSubtitleVoucher: "Part 3 — your game cover is below. Tap it when you’re ready for the real voucher.",
      phaseSubtitleDone: "Here’s your voucher — happy birthday.",
      momentsKicker: "Side quest",
      momentsTitle: "Moments of us I cherish",
      momentsSubtitle:
        "A short playlist I saved for you. Tap claim to unlock it — your reward path opens right after.",
      momentsClaimCta: "Claim these moments",
      momentsPlaylistKicker: "Playlist unlocked",
      momentsPlaylistTitle: "Moments of us I cherish",
      continueAfterVideosCta: "Continue",
      codePhaseKicker: "Next up",
      codePhaseTitle: "Something small I wrote",
      voucherLabel: "Your game voucher",
      voucherTitle: "Split Fiction",
      voucherImageSrc: "./assets/photos/split-fiction.jpeg",
      voucherImageAlt: "Split Fiction — cover",
      voucherTicketSrc: "./assets/photos/game-voucher.jpeg",
      voucherTicketAlt: "Your Split Fiction voucher",
      voucherRevealCta: "Click to reveal voucher",
      givenByLabel: "Given by",
      givenByName: "AWELEWA",
      resetButton: "Reset quest",

      videos: [
        {
          src: "https://res.cloudinary.com/dfw7cyzig/video/upload/q_auto/f_auto/v1775057481/video-of-ituah_jupx8y.mp4",
          title: "A video of you",
        },
        {
          src: "https://res.cloudinary.com/dfw7cyzig/video/upload/q_auto/f_auto/v1775057481/sipandpaint_hyf9uc.mp4",
          title: "Sip & Paint",
        },
        {
          src: "https://res.cloudinary.com/dfw7cyzig/video/upload/q_auto/f_auto/v1775057481/datenight_pjjjal.mp4",
          title: "Date Night",
        },
        {
          src: "https://res.cloudinary.com/dfw7cyzig/video/upload/q_auto/f_auto/v1775073251/random-video-of-us_znixd6.mp4",
          title: "Random video of us",
        },
      ],
    },
  },
};
