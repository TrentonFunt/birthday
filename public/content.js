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
    // Background music: direct .mp3 URL (Cloudinary). Starts after correct passcode (uses the tap as user gesture for iOS).
    backgroundAudioSrc:
      "https://res.cloudinary.com/dfw7cyzig/video/upload/q_auto/f_auto/v1775140915/Dandelions_Violin_jdt91g.mp3",
    backgroundAudioVolume: 0.6,
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
        {
          src: "./assets/photos/us-at-the-beach.jpeg",
          alt: "Us at the beach",
          caption: "Sun, sand, and you — my favorite kind of day.",
        },
        {
          src: "./assets/photos/just-us.jpeg",
          alt: "Just us",
          caption: "Just us. That’s all I need.",
        },
        {
          src: "./assets/photos/ituah.jpeg",
          alt: "Ituah",
          caption: "The face that rewires my whole mood.",
        },
        {
          src: "./assets/photos/datenight-2.jpeg",
          alt: "Date night",
          caption: "Date nights with you hit different.",
        },
        {
          src: "./assets/photos/us-together.jpeg",
          alt: "Us together",
          caption: "Us, always.",
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
          q: "What makes me love you?",
          choices: ["Your genotype", "Your cooking", "Your heart", "You"],
          correctIndex: 3,
        },
        {
          q: "What do you bring into my life that I’d never trade?",
          choices: [
            "Cold, distant energy",
            "Steady warmth and intention",
            "Unpredictable drama",
            "One-sided effort",
          ],
          correctIndex: 1,
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
      phaseSubtitleVideos:
        "On the last clip, tap Continue when you’re ready.",
      phaseSubtitleCode: "The next screen unlocks when it’s finished.",
      phaseSubtitleVoucher: "Tap to reveal your voucher",
      phaseSubtitleDone: "Here’s your voucher — happy birthday.",
      momentsKicker: "Side quest",
      momentsTitle: "Things I love about you",
      momentsSubtitle:
        "A short playlist I saved for you. Tap claim to unlock it — your reward path opens right after.",
      momentsClaimCta: "Claim these moments",
      momentsPlaylistKicker: "Playlist unlocked",
      momentsPlaylistTitle: "Things I love about you",
      continueAfterVideosCta: "Continue",
      pauseBetweenVideosMs: 1200,
      codePhaseKicker: "Next up",
      codePhaseTitle: "Something small I wrote",
      voucherLabel: "Your game voucher",
      voucherTitle: "Split Fiction",
      voucherImageSrc: "./assets/photos/split-fiction.jpeg",
      voucherImageAlt: "Split Fiction — cover",
      voucherTicketSrc: "./assets/photos/game-voucher.jpeg",
      voucherTicketAlt: "Your Split Fiction voucher",
      voucherRevealCta: "Click to reveal voucher",
      pauseAfterVideosMs: 2000,
      pauseAfterCodeMs: 1800,
      givenByLabel: "Given by",
      givenByName: "AWELEWA",
      resetButton: "Reset quest",

      videos: [
        {
          src: "https://res.cloudinary.com/dfw7cyzig/video/upload/q_auto/f_auto/v1775137531/WhatsApp_Video_2026-04-01_at_23.16.26_cetunv.mp4",
          title: "You aren’t shy to express your love for me",
        },
        {
          src: "https://res.cloudinary.com/dfw7cyzig/video/upload/q_auto/f_auto/v1775137461/WhatsApp_Video_2026-04-01_at_23.18.39_pshea1.mp4",
          title: "You are a praying man",
        },
        {
          src: "https://res.cloudinary.com/dfw7cyzig/video/upload/q_auto/f_auto/v1775137529/WhatsApp_Video_2026-04-01_at_23.21.03_vhzfld.mp4",
          title: "You let me make you pretty",
        },
        {
          src: "https://res.cloudinary.com/dfw7cyzig/video/upload/q_auto/f_auto/v1775137452/WhatsApp_Video_2026-04-01_at_23.22.49_wfu4hp.mp4",
          title: "You make me happyyyy",
        },
        {
          src: "https://res.cloudinary.com/dfw7cyzig/video/upload/q_auto/f_auto/v1775137035/WhatsApp_Video_2026-04-01_at_23.24.15_z9ec5e.mp4",
          title: "You are just Ituah",
        },
      ],
    },
  },
};
