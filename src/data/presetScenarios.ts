import { ScenarioModule } from '../types';

export const PRESET_SCENARIOS: ScenarioModule[] = [
  {
    id: 'ordering-mcdonalds',
    category: 'Giao tiếp Đời sống',
    topic: "Ordering Food at McDonald's",
    partner_scenario: {
      context: "A busy McDonald's drive-thru during the lunch rush.",
      ai_role: "A slightly impatient but professional drive-thru cashier.",
      user_role: "A customer who needs to customize their order.",
      opening_line: "Welcome to McDonald's, what can I get for you today?",
    },
    feynman_scenario: {
      student_persona: 'An ESL student who is confused about the difference between "I want a burger" and "Could I have a burger please".',
      initial_question: 'Why do native speakers often use "Could I have" instead of just saying "I want" when ordering food? Is "I want" considered rude?',
    },
  },
  {
    id: 'third-conditional',
    category: 'Ngữ pháp & Phản xạ',
    topic: 'Third Conditional (If I had known, I would have...)',
    partner_scenario: {
      context: 'Bạn bị lỡ chuyến bay nối tiếp quan trọng tại Chicago do chuyến tàu sáng bị hoãn.',
      ai_role: 'Nhân viên dịch vụ hàng không nghiêm nghị đang kiểm tra thủ tục đặt lại vé',
      user_role: 'Hành khách giải thích sự cố với câu điều kiện hối tiếc trong quá khứ',
      opening_line: "I'm sorry, but the boarding gate closed twenty minutes ago. Why didn't you arrive on time?",
    },
    feynman_scenario: {
      student_persona: 'Một học sinh THCS thắc mắc tại sao lại dùng "had known" thay vì "knew" khi nói về chuyện đã qua.',
      initial_question: 'Why do we have to say "If I had known" instead of "If I knew"? Aren\'t we just talking about yesterday?',
    },
  },
  {
    id: 'salary-negotiation',
    category: 'Giao tiếp Kinh doanh & Đàm phán',
    topic: 'Executive Salary & Compensation Review',
    partner_scenario: {
      context: 'Buổi đánh giá hiệu suất năm tại văn phòng Phó Giám đốc bàn về mức tăng lương 18%.',
      ai_role: 'Phó giám đốc vận hành yêu cầu giải trình giá trị trước khi duyệt ngân sách',
      user_role: 'Trưởng nhóm cấp cao trình bày đóng góp giá trị và điều chỉnh theo thị trường',
      opening_line: "I've reviewed your self-assessment, but budget caps are strict this quarter. Why should leadership allocate this budget to you?",
    },
    feynman_scenario: {
      student_persona: 'Một sinh viên đại học chuẩn bị đi thực tập, phân vân giữa việc tự tin và bị coi là kiêu ngạo khi đòi hỏi quyền lợi.',
      initial_question: 'Why do negotiation coaches say you shouldn\'t say "I need more money because rent is high"? What makes business value different from personal need?',
    },
  },
  {
    id: 'present-perfect-vs-past',
    category: 'Sư phạm & Bản chất Ngữ pháp',
    topic: 'Present Perfect vs. Past Simple Nuance',
    partner_scenario: {
      context: 'Phỏng vấn cấp tốc cho vị trí phóng viên quốc tế thường trú tại London.',
      ai_role: 'Tổng biên tập phỏng vấn sắc bén về kinh nghiệm thực địa chiến sự',
      user_role: 'Nhà báo nêu bật trải nghiệm quá khứ và sự sẵn sàng cho hiện tại',
      opening_line: "Have you ever reported from a conflict zone before, and when exactly was your last assignment?",
    },
    feynman_scenario: {
      student_persona: 'Một người học tiếng Anh bối rối phân biệt "I have lived here for 5 years" và "I lived here for 5 years".',
      initial_question: 'If both actions happened in the past, why can\'t I just use past simple for everything? Why does Present Perfect even exist?',
    },
  },
  {
    id: 'explain-ai',
    category: 'Phương pháp Feynman Đời thường',
    topic: 'Explaining Machine Learning & AI Simply',
    partner_scenario: {
      context: 'Cuộc trò chuyện ngắn 30 giây ở hành lang với Tổng giám đốc khách hàng vốn hoài nghi về công nghệ.',
      ai_role: 'Giám đốc truyền thống nghĩ rằng AI chỉ là chiêu trò quảng cáo thổi phồng',
      user_role: 'Chuyên gia tư vấn công nghệ giải thích thuật toán học máy một cách trực quan',
      opening_line: "Everyone keeps throwing around 'AI', but isn't it just a glorified spreadsheet doing math?",
    },
    feynman_scenario: {
      student_persona: 'Một đứa trẻ 10 tuổi tò mò nghe trên YouTube rằng máy tính biết suy nghĩ và muốn biết máy tính học thế nào.',
      initial_question: 'How can a machine learn things if nobody types every single answer into its code like a regular video game?',
    },
  },
];
