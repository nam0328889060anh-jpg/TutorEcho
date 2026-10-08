export type Language = 'vi' | 'en';

export interface Translations {
  appName: string;
  tagline: string;
  modes: {
    scenarios: string;
    reflexBlitz: string;
    feynman: string;
    srsDeck: string;
  };
  scenarioGen: {
    badge: string;
    title: string;
    description: string;
    inputLabel: string;
    inputPlaceholder: string;
    quickTopicsLabel: string;
    btnSynthesize: string;
    btnSynthesizing: string;
    presetHeading: string;
    activePackage: string;
    inspectJson: string;
    hideJson: string;
    copied: string;
    copy: string;
    reflexTitle: string;
    reflexTag: string;
    reflexContext: string;
    aiRole: string;
    yourRole: string;
    openingLine: string;
    listen: string;
    reflexBullet1: string;
    reflexBullet2: string;
    reflexBullet3: string;
    btnLaunchReflex: string;
    feynmanTitle: string;
    feynmanTag: string;
    personaLabel: string;
    questionLabel: string;
    feynmanBullet1: string;
    feynmanBullet2: string;
    feynmanBullet3: string;
    btnLaunchFeynman: string;
    errorEmpty: string;
  };
  reflexSession: {
    switchScenario: string;
    turnsBlitz: string;
    timerLabel: string;
    diagnoseBtn: string;
    scenarioLabel: string;
    aiPartner: string;
    yourRole: string;
    pressureTimer: string;
    timeUpMsg: string;
    pressureSub: string;
    reflexSpeed: string;
    microFix: string;
    saveToDeck: string;
    saved: string;
    responding: string;
    listenMic: string;
    stopMic: string;
    inputPlaceholder: string;
    inputListening: string;
    rulesFooter: string;
    pressEnter: string;
  };
  feynmanSession: {
    switchScenario: string;
    topicLabel: string;
    studentPersona: string;
    statusProbing: string;
    statusConfused: string;
    statusEnlightened: string;
    goldenRuleTitle: string;
    goldenRuleDesc: string;
    teacherBadge: string;
    studentBadge: string;
    studentThinking: string;
    inputPlaceholder: string;
    inputListening: string;
    footerRule: string;
  };
  diagnosis: {
    badge: string;
    title: string;
    analyzingTitle: string;
    analyzingDesc: string;
    fluencyScoreLabel: string;
    scoreSub: string;
    verdictTitle: string;
    verdictSub: string;
    mistakesTitle: string;
    mistakesCount: string;
    noMistakes: string;
    rationale: string;
    youSaid: string;
    correction: string;
    srsTitle: string;
    addAllBtn: string;
    allAdded: string;
    frontLabel: string;
    backLabel: string;
    intervalLabel: string;
    saveCardBtn: string;
    savedCheck: string;
    exportBtn: string;
    closeBtn: string;
    practiceDeckBtn: string;
  };
  flashcards: {
    srsBadge: string;
    activeReview: string;
    title: string;
    newCardBtn: string;
    exportBtn: string;
    filterLabel: string;
    allCards: string;
    createTitle: string;
    frontPromptLabel: string;
    frontPromptPlaceholder: string;
    backLabel: string;
    backPlaceholder: string;
    topicTagLabel: string;
    topicTagPlaceholder: string;
    cancelBtn: string;
    saveBtn: string;
    emptyTitle: string;
    emptyDesc: string;
    goScenariosBtn: string;
    cardCount: string;
    interval: string;
    frontTag: string;
    clickToFlip: string;
    backTag: string;
    backInstruction: string;
    deleteCard: string;
    ratePrompt: string;
    againBtn: string;
    againSub: string;
    goodBtn: string;
    goodSub: string;
    easyBtn: string;
    easySub: string;
    prevBtn: string;
    nextBtn: string;
  };
  geminiHome: {
    greeting: string;
    greetingSub: string;
    askInputPlaceholder: string;
    modelTag: string;
    btnGenerate: string;
  };
  theme: {
    dark: string;
    light: string;
    toggleTheme: string;
  };
  sidebar: {
    collapse: string;
    expand: string;
    newTopic: string;
    settings: string;
  };
  tooltips: {
    soundOn: string;
    soundOff: string;
    langSwitch: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  vi: {
    appName: 'TutorEcho',
    tagline: 'Huấn luyện viên Phản xạ & Phương pháp Feynman',
    modes: {
      scenarios: 'Kịch bản & Chủ đề',
      reflexBlitz: 'Phản xạ cấp tốc',
      feynman: 'Dạy học Feynman',
      srsDeck: 'Bộ thẻ SRS',
    },
    scenarioGen: {
      badge: 'Bộ tạo Mô-đun Luyện nói',
      title: 'Tạo Kịch bản & Mô-đun Luyện nói',
      description: 'Nhập ghi chú học tập, điểm ngữ pháp hoặc chủ đề hội thoại. TutorEcho tự động sinh cặp mô-đun kép: Luyện Phản xạ tiếng Anh áp lực thời gian và Thử thách hiểu sâu theo Kỹ thuật Feynman.',
      inputLabel: 'Ghi chú, ngữ pháp mục tiêu hoặc chủ đề bài học',
      inputPlaceholder: 'Ví dụ: Câu điều kiện loại 3 (If + had V3/ed, would have V3/ed), diễn tả sự tiếc nuối trong quá khứ hoặc tình huống giả định...',
      quickTopicsLabel: 'Chủ đề gợi ý:',
      btnSynthesize: 'Tạo Mô-đun Luyện Tập',
      btnSynthesizing: 'Đang khởi tạo...',
      presetHeading: 'Hoặc chọn nhanh kịch bản có sẵn',
      activePackage: 'Chủ Đề Đang Chọn Để Luyện Tập',
      inspectJson: 'Xem JSON',
      hideJson: 'Đóng JSON',
      copied: 'Đã sao chép!',
      copy: 'Sao chép',
      reflexTitle: 'Luyện Phản Xạ Nói',
      reflexTag: 'Phản xạ nhanh 15s - 20s',
      reflexContext: 'Ngữ cảnh thực tế:',
      aiRole: 'Vai trò AI:',
      yourRole: 'Vai trò của bạn:',
      openingLine: 'Câu mở đầu của AI:',
      listen: 'Nghe',
      reflexBullet1: 'Đếm ngược 15s/20s ép phản xạ bật ra tức thì, phá vỡ ngập ngừng',
      reflexBullet2: 'Sửa lỗi vi mô trực tiếp (💡 Fix: ...) khi có sai sót ngữ pháp/từ vựng',
      reflexBullet3: 'Nhịp độ đối thoại nhanh, phát âm chuẩn tự nhiên',
      btnLaunchReflex: 'Bắt đầu Luyện Phản Xạ',
      feynmanTitle: 'Hiểu Sâu Kỹ Thuật Feynman',
      feynmanTag: 'Phương pháp Feynman giải thích đơn giản',
      personaLabel: 'Học viên tò mò (AI):',
      questionLabel: 'Câu hỏi "Tại sao" cốt lõi:',
      feynmanBullet1: 'Bạn đóng vai Thầy/Cô giáo giải thích kiến thức; AI đóng vai học sinh',
      feynmanBullet2: 'AI phát hiện thuật ngữ trừu tượng và yêu cầu bạn cho ví dụ thực tế đời sống',
      feynmanBullet3: 'Học sinh công nhận thấu hiểu khi bạn giải thích mạch lạc, gần gũi',
      btnLaunchFeynman: 'Bắt đầu Dạy Học Feynman',
      errorEmpty: 'Vui lòng nhập ghi chú học tập hoặc chọn một chủ đề gợi ý.',
    },
    reflexSession: {
      switchScenario: 'Đổi kịch bản',
      turnsBlitz: 'Lượt phản xạ',
      timerLabel: 'Hạn giờ:',
      diagnoseBtn: 'Chẩn đoán buổi học',
      scenarioLabel: 'Tình huống:',
      aiPartner: 'Đối tác AI:',
      yourRole: 'Vai của bạn:',
      pressureTimer: 'Đồng hồ Áp lực Phản xạ:',
      timeUpMsg: 'Hết giờ! Hãy nói hoặc gửi ngay',
      pressureSub: 'Ép tư duy nói tiếng Anh trực tiếp không dịch',
      reflexSpeed: 'tốc độ:',
      microFix: '💡 Góp ý sửa nhanh:',
      saveToDeck: '+ Lưu thẻ',
      saved: 'Đã lưu',
      responding: 'AI đang phản hồi...',
      listenMic: 'Bấm để nói bằng giọng nói',
      stopMic: 'Đang nghe... bấm để dừng',
      inputPlaceholder: 'Nói qua mic hoặc nhập phản xạ tiếng Anh của bạn...',
      inputListening: 'Đang nghe giọng của bạn...',
      rulesFooter: 'Quy tắc: 1-2 câu ngắn · Giữ nhịp độ cao · Tự động sửa lỗi vi mô',
      pressEnter: 'Nhấn Enter để gửi',
    },
    feynmanSession: {
      switchScenario: 'Đổi chủ đề',
      topicLabel: 'Chủ đề giảng dạy:',
      studentPersona: 'Học viên (AI):',
      statusProbing: 'Đang đặt câu hỏi phản biện',
      statusConfused: 'Chưa hiểu (quá nhiều thuật ngữ)',
      statusEnlightened: 'Đã hiểu rõ hoàn toàn! 🎯',
      goldenRuleTitle: 'Quy tắc vàng Feynman:',
      goldenRuleDesc: 'Hãy giải thích sao cho một học sinh 10 tuổi cũng hiểu được. Nếu bạn dùng định nghĩa sách vở mà không có ví dụ thực tế (như pizza, đồ chơi, tình huống hàng ngày), học sinh sẽ tiếp tục thắc mắc!',
      teacherBadge: 'Bạn (Giáo viên)',
      studentBadge: 'Học sinh tò mò (AI)',
      studentThinking: 'Học sinh đang suy ngẫm câu hỏi tiếp theo...',
      inputPlaceholder: 'Giải thích bằng từ ngữ đơn giản hoặc đưa ra ví dụ trực quan...',
      inputListening: 'Đang ghi nhận giọng nói giảng bài của bạn...',
      footerRule: 'Vai trò: Giáo viên · Loại bỏ thuật ngữ phức tạp · Đưa ví dụ cụ thể',
    },
    diagnosis: {
      badge: 'Báo cáo Chẩn đoán Buổi học',
      title: 'Chẩn đoán Ngôn ngữ & Đánh giá Sư phạm',
      analyzingTitle: 'Đang phân tích phản xạ & độ sâu kiến thức...',
      analyzingDesc: 'Đánh giá độ trôi chảy, sàng lọc lỗi lặp lại và tạo thẻ ghi nhớ lặp lại ngắt quãng (SRS).',
      fluencyScoreLabel: 'Điểm Phản Xạ & Độ Trôi Chảy',
      scoreSub: 'Thang điểm 1 - 10',
      verdictTitle: 'Đánh giá Hiểu sâu Feynman',
      verdictSub: 'Hiểu bản chất thực tế vs chỉ học vẹt lý thuyết',
      mistakesTitle: 'Chi tiết Lỗi Ngữ pháp & Từ vựng Phát hiện được',
      mistakesCount: 'lỗi ghi nhận',
      noMistakes: 'Xuất sắc! Không phát hiện lỗi ngôn ngữ nào trong buổi tập này.',
      rationale: 'Giải thích:',
      youSaid: 'Bạn đã nói:',
      correction: 'Cách nói chuẩn hơn:',
      srsTitle: 'Bộ Thẻ Ghi Nhớ Ngắt Quãng (SRS) Được Tạo Tự Động',
      addAllBtn: 'Thêm Tất Cả Vào Bộ Thẻ SRS',
      allAdded: 'Đã thêm toàn bộ thẻ',
      frontLabel: 'Mặt trước (Lỗi cần sửa / Thử thách):',
      backLabel: 'Mặt sau (Câu nói chuẩn phản xạ):',
      intervalLabel: 'Khoảng cách ôn:',
      saveCardBtn: '+ Lưu thẻ này',
      savedCheck: 'Đã lưu ✓',
      exportBtn: 'Xuất Báo Cáo JSON',
      closeBtn: 'Đóng',
      practiceDeckBtn: 'Luyện Bộ Thẻ Ngay',
    },
    flashcards: {
      srsBadge: 'Hệ thống Lặp lại Ngắt quãng (SRS)',
      activeReview: 'Ôn tập phản xạ',
      title: 'Bộ Thẻ Luyện Nói & Sửa Lỗi',
      newCardBtn: 'Tạo thẻ mới',
      exportBtn: 'Xuất bộ thẻ',
      filterLabel: 'Lọc chủ đề:',
      allCards: 'Tất cả thẻ',
      createTitle: 'Tạo thẻ thủ công mới',
      frontPromptLabel: 'Mặt trước (Câu lỗi hoặc câu hỏi phản xạ):',
      frontPromptPlaceholder: 'VD: Sửa câu này: "If I knew earlier, I would call you"',
      backLabel: 'Mặt sau (Câu nói chuẩn mực):',
      backPlaceholder: 'VD: "If I had known earlier, I would have called you."',
      topicTagLabel: 'Chủ đề (Tùy chọn):',
      topicTagPlaceholder: 'VD: Câu điều kiện loại 3',
      cancelBtn: 'Hủy',
      saveBtn: 'Lưu thẻ',
      emptyTitle: 'Chưa có thẻ ghi nhớ nào trong danh mục này',
      emptyDesc: 'Hãy hoàn thành một buổi Luyện Phản Xạ hoặc Dạy học Feynman rồi bấm "Chẩn đoán buổi học" để tự động nhận thẻ!',
      goScenariosBtn: 'Đến danh sách Kịch bản',
      cardCount: 'Thẻ',
      interval: 'Chu kỳ ôn:',
      frontTag: 'MẶT TRƯỚC · CÂU HỎI PHẢN XẠ',
      clickToFlip: 'Bấm vào thẻ để lật mặt sau',
      backTag: 'MẶT SAU · CÂU NÓI CHUẨN XÁC',
      backInstruction: 'Hãy đọc to câu này để ghi nhớ phản xạ phát âm!',
      deleteCard: 'Xóa thẻ này',
      ratePrompt: 'Đánh giá mức độ phản xạ tự tin của bạn:',
      againBtn: 'Chưa thuộc (Ngập ngừng)',
      againSub: 'Ôn lại sau 1 ngày',
      goodBtn: 'Khá tốt (Nói được)',
      goodSub: 'Ôn lại sau 3 ngày',
      easyBtn: 'Rất dễ (Bật ra ngay)',
      easySub: 'Ôn lại sau 7 ngày',
      prevBtn: 'Thẻ trước',
      nextBtn: 'Thẻ tiếp theo',
    },
    geminiHome: {
      greeting: 'Tiếp theo sẽ là gì, Nam Anh?',
      greetingSub: 'Nhập chủ đề hội thoại, tình huống đàm phán hoặc điểm ngữ pháp bạn muốn huấn luyện hôm nay.',
      askInputPlaceholder: 'Hỏi hoặc nhập chủ đề luyện tiếng Anh...',
      modelTag: 'Flash',
      btnGenerate: 'Bắt đầu',
    },
    theme: {
      dark: 'Chế độ Tối (Night Mode)',
      light: 'Chế độ Sáng (Light Mode)',
      toggleTheme: 'Chuyển Đổi Sáng / Tối',
    },
    sidebar: {
      collapse: 'Thu gọn thanh bên',
      expand: 'Mở rộng thanh bên',
      newTopic: 'Chủ đề mới',
      settings: 'Cài đặt',
    },
    tooltips: {
      soundOn: 'Tắt âm thanh',
      soundOff: 'Bật âm thanh & giọng đọc',
      langSwitch: 'Chuyển sang English',
    },
  },
  en: {
    appName: 'TutorEcho',
    tagline: 'Spoken Reflex & Feynman English Coach',
    modes: {
      scenarios: 'Scenarios & Topics',
      reflexBlitz: 'Reflex Blitz',
      feynman: 'Feynman Teaching',
      srsDeck: 'SRS Flashcards',
    },
    scenarioGen: {
      badge: 'Scenario & Module Generator',
      title: 'Scenario & Module Generator',
      description: 'Input raw study notes, target grammar points, or business themes. TutorEcho automatically constructs twin dual-track modules: a high-pressure Spoken Reflex Roleplay and an inquisitive Feynman Deep Understanding gauntlet.',
      inputLabel: 'Study notes, target grammar, or lesson topic',
      inputPlaceholder: 'e.g. Third conditional structure (If + had V3, would have V3). Used for talking about past regrets or hypothetical historical events...',
      quickTopicsLabel: 'Quick Topics:',
      btnSynthesize: 'Synthesize Twin Modules',
      btnSynthesizing: 'Synthesizing...',
      presetHeading: 'Or select a pre-configured coaching scenario',
      activePackage: 'Selected Practice Topic',
      inspectJson: 'Inspect JSON',
      hideJson: 'Hide JSON',
      copied: 'Copied!',
      copy: 'Copy',
      reflexTitle: 'Spoken Reflex Practice',
      reflexTag: '15s - 20s Reflex Blitz',
      reflexContext: 'Real-world Context:',
      aiRole: 'AI Role:',
      yourRole: 'Your Role:',
      openingLine: 'AI Opening Line:',
      listen: 'Listen',
      reflexBullet1: 'Strict 15s/20s countdown forces spontaneous production without hesitation',
      reflexBullet2: 'Discreet micro-corrections (💡 Fix: ...) on grammar or lexical errors',
      reflexBullet3: 'High conversational velocity with natural native audio',
      btnLaunchReflex: 'Start Spoken Reflex Practice',
      feynmanTitle: 'Feynman Deep Understanding',
      feynmanTag: 'Feynman Intuitive Explanation',
      personaLabel: 'Curious Student Persona (AI):',
      questionLabel: 'Core "Why" Question:',
      feynmanBullet1: 'You act as the Teacher; AI acts as an inquisitive student',
      feynmanBullet2: 'Jargon-busting Socratic challenges if you recite abstract rules without examples',
      feynmanBullet3: 'Yields & celebrates when you provide simple, concrete analogies',
      btnLaunchFeynman: 'Start Feynman Teaching',
      errorEmpty: 'Please provide study text, notes, or grammar points.',
    },
    reflexSession: {
      switchScenario: 'Switch Scenario',
      turnsBlitz: 'Turns Blitz',
      timerLabel: 'Timer:',
      diagnoseBtn: 'Diagnose Session',
      scenarioLabel: 'Situation:',
      aiPartner: 'AI Partner:',
      yourRole: 'Your Role:',
      pressureTimer: 'Reflex Pressure Timer:',
      timeUpMsg: 'Time up! Speak or submit now',
      pressureSub: 'Forces spontaneous English production',
      reflexSpeed: 'reflex:',
      microFix: '💡 Fix:',
      saveToDeck: '+ Deck',
      saved: 'Saved',
      responding: 'AI Partner responding...',
      listenMic: 'Click to speak aloud',
      stopMic: 'Listening... click to stop',
      inputPlaceholder: 'Speak aloud or type your immediate spoken reflex...',
      inputListening: 'Listening to your voice...',
      rulesFooter: 'Rules: 1-2 spoken sentences · High conversational pace · Real-time micro-corrections',
      pressEnter: 'Press Enter to fire',
    },
    feynmanSession: {
      switchScenario: 'Switch Scenario',
      topicLabel: 'Teaching Topic:',
      studentPersona: 'Student Persona:',
      statusProbing: 'Probing Understanding',
      statusConfused: 'Puzzled by Jargon',
      statusEnlightened: 'Mastery Acknowledged! 🎯',
      goldenRuleTitle: 'The Feynman Rule:',
      goldenRuleDesc: 'Explain simply enough that anyone can understand. If you rely on academic jargon without real-world examples, your student will challenge you. Yielding happens when your explanation is clear and grounded!',
      teacherBadge: 'You (Teacher)',
      studentBadge: 'Curious Student (AI)',
      studentThinking: 'Student is formulating follow-up...',
      inputPlaceholder: 'Explain the concept or give a simple concrete analogy...',
      inputListening: 'Listening to your verbal explanation...',
      footerRule: 'Role: You are the Teacher · Strip away complex jargon · Use concrete examples',
    },
    diagnosis: {
      badge: 'Diagnostic Report',
      title: 'Diagnostic & Pedagogical Evaluation',
      analyzingTitle: 'Analyzing Spoken Cadence & Conceptual Depth...',
      analyzingDesc: 'Evaluating grammar precision, spontaneous reflex latency, and synthesizing SRS flashcards.',
      fluencyScoreLabel: 'Spoken Fluency Score',
      scoreSub: 'Score from 1 to 10',
      verdictTitle: 'Feynman Concept Verdict',
      verdictSub: 'Assessment: True pedagogical understanding vs. dogma recitation',
      mistakesTitle: 'Identified Linguistic & Conceptual Flaws',
      mistakesCount: 'items identified',
      noMistakes: 'Flawless production! No recurring linguistic flaws detected in this session.',
      rationale: 'Rationale:',
      youSaid: 'You said:',
      correction: 'Recommended correction:',
      srsTitle: 'Generated Spaced Repetition (SRS) Flashcards',
      addAllBtn: 'Add All to SRS Deck',
      allAdded: 'All Cards Added',
      frontLabel: 'Front (Challenge / Error):',
      backLabel: 'Back (Target Spoken):',
      intervalLabel: 'Interval:',
      saveCardBtn: '+ Save Card',
      savedCheck: 'Added ✓',
      exportBtn: 'Export JSON Report',
      closeBtn: 'Close',
      practiceDeckBtn: 'Practice SRS Deck Now',
    },
    flashcards: {
      srsBadge: 'Spaced Repetition System',
      activeReview: 'Active Deck Review',
      title: 'Spoken Reflex & Flaw Flashcards',
      newCardBtn: 'New Flashcard',
      exportBtn: 'Export Deck',
      filterLabel: 'Filter Deck:',
      allCards: 'All Cards',
      createTitle: 'Create Custom Flashcard',
      frontPromptLabel: 'Front Prompt (Error or spoken challenge):',
      frontPromptPlaceholder: 'e.g. Fix this: "If I knew earlier, I would call you"',
      backLabel: 'Back (Ideal spoken response):',
      backPlaceholder: 'e.g. "If I had known earlier, I would have called you."',
      topicTagLabel: 'Topic Tag (Optional):',
      topicTagPlaceholder: 'e.g. Third Conditional',
      cancelBtn: 'Cancel',
      saveBtn: 'Save to Deck',
      emptyTitle: 'No Flashcards in this category yet',
      emptyDesc: 'Run a Reflex Blitz or Feynman Teaching session and conclude to automatically generate diagnosis flashcards!',
      goScenariosBtn: 'Go to Practice Scenarios',
      cardCount: 'Card',
      interval: 'Interval:',
      frontTag: 'FRONT · SPOKEN PROMPT',
      clickToFlip: 'Click card to flip and reveal ideal response',
      backTag: 'BACK · TARGET SPOKEN CADENCE',
      backInstruction: 'Say this aloud to anchor spontaneous speech neural pathways!',
      deleteCard: 'Delete card',
      ratePrompt: 'Rate your spoken recall confidence:',
      againBtn: 'Again (Hesitated)',
      againSub: '1 day interval',
      goodBtn: 'Good (Clear)',
      goodSub: '3 days interval',
      easyBtn: 'Easy (Instant Reflex)',
      easySub: '7 days interval',
      prevBtn: 'Previous',
      nextBtn: 'Next',
    },
    geminiHome: {
      greeting: 'What’s next, Nam Anh?',
      greetingSub: 'Enter a speaking topic, negotiation scenario, or grammar rule to practice today.',
      askInputPlaceholder: 'Ask or enter an English topic to practice...',
      modelTag: 'Flash',
      btnGenerate: 'Start',
    },
    theme: {
      dark: 'Night / Dark Mode',
      light: 'Light Mode',
      toggleTheme: 'Toggle Light / Dark',
    },
    sidebar: {
      collapse: 'Collapse sidebar',
      expand: 'Expand sidebar',
      newTopic: 'New topic',
      settings: 'Settings',
    },
    tooltips: {
      soundOn: 'Mute Audio',
      soundOff: 'Unmute Audio & Speech',
      langSwitch: 'Chuyển sang Tiếng Việt',
    },
  },
};
