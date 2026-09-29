import { UNIZULU_FACULTIES, FacultyDetail, FacultyDegree } from '../data/unizuluKnowledge';
import { HANDBOOK_MODULES, CourseModule } from '../data/handbookModules';
import { formatSingleCourseDetails } from './courseKnowledge';

export interface TargetedQueryResult {
  handled: boolean;
  text: string;
  source?: string;
}

/**
 * Normalizes text for robust comparison
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * 1. Resolves Quick Suggestion Prompts from the Cover Page
 */
export function resolveCoverPageQuickSuggestion(lowerMsg: string): TargetedQueryResult | null {
  const trimmed = lowerMsg.trim().toLowerCase();

  // Only trigger on exact or near-exact prompt clicks, never on conversational questions
  if (
    trimmed === 'what undergraduate qualifications can i study at the university of zululand across all faculties?' ||
    trimmed === 'what undergraduate qualifications can i study across all faculties?' ||
    trimmed === 'what can i study at unizulu?' ||
    trimmed === 'what undergraduate qualifications can i study?'
  ) {
    return {
      handled: true,
      source: 'UNIZULU 2026 Academic Catalog',
      text: `### 🎓 Undergraduate Qualifications at the University of Zululand (UNIZULU) 🏛️✨

UNIZULU offers accredited undergraduate qualifications across **4 academic faculties**:

• ⚖️ **Faculty of Commerce, Administration and Law (FCAL)**:
  - Bachelor of Laws (LLB) — 4 Years • Minimum APS: 30
  - BCom Accounting Science (SAICA) — 4 Years • Minimum APS: 28 (Pure Maths required)
  - BCom (General / Business Management / Economics) — 3 Years • Minimum APS: 28
  - Bachelor of Public Administration (BAdmin) — 3 Years • Minimum APS: 24
  - Diplomas: Management Studies, Public Relations, Transport & Logistics (Richards Bay Campus, APS 22)

• 🔬 **Faculty of Science, Agriculture and Engineering (SAE)**:
  - BSc Computer Science — Minimum APS: 28–34 (Pure Maths required)
  - Bachelor of Nursing Science — 4 Years • Minimum APS: 30
  - BSc Agriculture (Agronomy, Animal Science) — Minimum APS: 28
  - BSc Hydrology, Biochemistry, Microbiology, Physics, Chemistry — Minimum APS: 28

• 📚 **Faculty of Education (EDU)**:
  - BEd in Foundation Phase Teaching (Grades R–3) — Minimum APS: 26
  - BEd in Intermediate Phase Teaching (Grades 4–7) — Minimum APS: 26
  - BEd in Senior Phase & FET Teaching (Grades 8–12) — Minimum APS: 26

• 🌍 **Faculty of Humanities and Social Sciences (HSS)**:
  - Bachelor of Social Work (BSW) — 4 Years • Minimum APS: 28–30
  - BA in Psychology, Communication Science, Development Studies, Criminology — Minimum APS: 26

💡 *Ask me about any specific qualification for exact entry requirements, APS, or CAO codes!*`
    };
  }

  // Quick Prompt 2: General admission requirements and minimum APS scores
  if (
    trimmed === 'what are the general admission requirements and minimum aps scores for unizulu programmes?' ||
    trimmed === 'general admission requirements and minimum aps scores'
  ) {
    return {
      handled: true,
      source: 'UNIZULU Admissions Policy 2026',
      text: `### 📋 UNIZULU General Admission Benchmarks & APS Formula 🎯✨

Admission into UNIZULU requires a National Senior Certificate (NSC) with the relevant pass endorsement:

• **Bachelor's Degrees** (e.g. LLB, BCom, BSc, BEd, BSW):
  - **Endorsement**: NSC Bachelor's degree pass.
  - **Minimum APS**: Typically **26 to 32 points** (excluding Life Orientation).
  - **English**: Level 4 (50%+) minimum.

• **National Diplomas** (e.g. Management, Public Relations, Transport):
  - **Endorsement**: NSC Diploma pass.
  - **Minimum APS**: Minimum **22 to 26 points**.
  - **English**: Level 3 (40%) or Level 4 (50%).

• **Higher Certificates**:
  - **Endorsement**: NSC Higher Certificate pass.
  - **Minimum APS**: Minimum **19 to 22 points**.

⚠️ **Critical APS Rule**: UNIZULU calculates APS strictly using your **top 6 subjects, excluding Life Orientation (LO = 0 points)**. Total score is out of 42.`
    };
  }

  // Quick Prompt 3: Apply via CAO step by step
  if (
    trimmed === 'how do i apply to the university of zululand through the central applications office (cao) step by step?' ||
    trimmed === 'how do i apply to the university of zululand through the central applications office?' ||
    trimmed === 'apply to unizulu via cao step by step'
  ) {
    return {
      handled: true,
      source: 'Central Applications Office (CAO) & UNIZULU Admissions',
      text: `### 📝 Step-by-Step Guide: Applying to UNIZULU via CAO 🌐✨

All prospective undergraduate students apply through the **Central Applications Office (CAO)**:

1. **Visit the CAO Portal**: Go to **[www.cao.ac.za](https://www.cao.ac.za)** and click **"Apply Now"**.
2. **Personal & Results Details**: Enter your SA ID (or Passport) and Grade 11 final report or Matric statement.
3. **Select UNIZULU Programmes**: Use official **'ZU-' codes**:
   - \`ZU-M-...\` = **KwaDlangezwa Main Campus** (e.g. \`ZU-M-LLB\` for Law).
   - \`ZU-R-...\` = **Richards Bay Campus** (e.g. \`ZU-R-NDM\` for Management Diploma).
4. **Pay Application Fee**: **R250** (on-time SA citizen) or **R470** (late) via card or EasyPay outlet.
5. **Upload Certified Documents**: Upload certified ID, Grade 11/12 report, and proof of payment on CAO.

⚠️ **Note**: UNIZULU strictly enforces a **NO WALK-INS** policy. All applications must be submitted online through CAO.`
    };
  }

  return null;
}

/**
 * 2. Resolves Faculty-Level Questions (e.g. "Tell me about FCAL", "Overview of the Faculty of Education", etc.)
 */
export function resolveFacultyOverviewQuery(lowerMsg: string): TargetedQueryResult | null {
  // If asking a specific question, do NOT treat as static faculty overview
  const isQuestion = (
    lowerMsg.includes('?') ||
    lowerMsg.includes('bachelor') ||
    lowerMsg.includes('diploma') ||
    lowerMsg.includes('llb') ||
    lowerMsg.includes('aps') ||
    lowerMsg.includes('points') ||
    lowerMsg.includes('score') ||
    lowerMsg.includes('cao code') ||
    lowerMsg.includes('minimum aps') ||
    lowerMsg.includes('requirements for') ||
    lowerMsg.includes('can i') ||
    lowerMsg.includes('maths')
  );

  if (isQuestion) {
    return null;
  }

  const isFacultyQuery = (
    lowerMsg.startsWith('tell me about the faculty') ||
    lowerMsg.startsWith('overview of the faculty') ||
    lowerMsg.startsWith('tell me about faculty') ||
    lowerMsg === 'faculty of commerce, administration and law' ||
    lowerMsg === 'faculty of science, agriculture and engineering' ||
    lowerMsg === 'faculty of education' ||
    lowerMsg === 'faculty of humanities and social sciences' ||
    lowerMsg === 'fcal' ||
    lowerMsg === 'sae' ||
    lowerMsg === 'hss' ||
    lowerMsg === 'fedu'
  );

  if (!isFacultyQuery) return null;

  // Faculty of Commerce, Administration and Law
  if (lowerMsg.includes('commerce') || lowerMsg.includes('cal') || lowerMsg.includes('fcal') || lowerMsg.includes('law')) {
    const fcal = UNIZULU_FACULTIES.find(f => f.code === 'CAL');
    return {
      handled: true,
      source: 'Faculty of Commerce, Administration and Law (FCAL) 2026 Handbook',
      text: `### ⚖️ Faculty of Commerce, Administration and Law (FCAL) 🏛️✨

• **Campuses**: **KwaDlangezwa Main Campus** (D-Block) & **Richards Bay Coastal Campus**.
• **Accreditation**: Fully accredited by the Council on Higher Education (CHE), SAQA, and the South African Institute of Chartered Accountants (SAICA).

#### 🎯 Key Academic Departments & Schools:
1. **Accounting & Auditing**: Delivers SAICA-accredited CA(SA) training and accounting programmes.
2. **Law (Private, Public, Criminal & Procedural Law)**: Offers the premier 4-Year Bachelor of Laws (LLB).
3. **Business Management & Marketing**: General management, financial management, and entrepreneurship.
4. **Economics & Banking**: Microeconomics, macroeconomics, banking operations, and financial markets.
5. **Public Administration**: Public policy, local government administration, and governance.

#### 🎓 Flagship Undergraduate Degrees & Minimum APS:
• **Bachelor of Laws (LLB)**: 4 Years • Minimum APS: **30 Points** (Pure Maths 40% OR Maths Lit 50%, English 50%) • CAO: \`ZU-M-LLB\`
• **BCom Accounting Science (SAICA)**: 4 Years • Minimum APS: **28 Points** (Pure Maths 50%, English 50%) • CAO: \`ZU-M-BCA\`
• **BCom (General / Double Majors)**: 3 Years • Minimum APS: **28 Points** • CAO: \`ZU-M-BCE\`
• **Bachelor of Public Administration (BAdmin)**: 3 Years • Minimum APS: **24 Points** • CAO: \`ZU-M-PAD\`
• **Diploma in Management Studies**: 3 Years (Richards Bay) • Minimum APS: **22 Points** • CAO: \`ZU-R-NDM\`

💡 *Would you like detailed admission requirements for a specific degree in this faculty?*`
    };
  }

  // Faculty of Science, Agriculture and Engineering
  if (lowerMsg.includes('science') || lowerMsg.includes('sae') || lowerMsg.includes('agriculture') || lowerMsg.includes('engineering')) {
    const sae = UNIZULU_FACULTIES.find(f => f.code === 'SAE');
    return {
      handled: true,
      source: 'Faculty of Science, Agriculture & Engineering (SAE) 2026 Calendar',
      text: `### 🔬 Faculty of Science, Agriculture and Engineering (SAE) 🌾✨

• **Campuses**: **KwaDlangezwa Main Campus** (Natural Sciences & Agriculture) & **Richards Bay Campus** (Engineering & Technology).
• **Overview**: Known for world-class research facilities, the UNIZULU Science Centre, agricultural research farms, and high-impact STEM training.

#### 🎯 Key Academic Disciplines:
1. **Mathematical & Computer Sciences**: Computer Science, Applied Mathematics, Statistics.
2. **Physical & Chemical Sciences**: Physics, Chemistry, Hydrology, Geography, Environmental Science.
3. **Life Sciences & Biotechnology**: Biochemistry, Microbiology, Botany, Zoology.
4. **Agriculture & Consumer Sciences**: Agronomy, Animal Science, Agribusiness, Food & Nutrition.
5. **Engineering & Technology**: Bachelor of Engineering Technology (Richards Bay).
6. **Health Sciences**: Nursing Science (Clinical nursing, midwifery, and community health).

#### 🎓 Flagship Undergraduate Programmes & Minimum APS:
• **Bachelor of Nursing Science**: 4 Years • Minimum APS: **30 Points** (English 50%, Life Sciences 50%, Pure Maths/Maths Lit)
• **BSc in Computer Science (Double Majors)**: 3 Years • Minimum APS: **28 Points** (Pure Maths 50%, English 50%)
• **BSc in Agriculture (Agronomy / Animal Science)**: 4 Years • Minimum APS: **28 Points** (Pure Maths 50%, Physical Sciences / Life Sciences)
• **BSc in Biochemistry & Microbiology**: 3 Years • Minimum APS: **28 Points**
• **Diploma in Sport & Exercise Science**: 3 Years • Minimum APS: **24 Points**

💡 *Ask me about any specific science, engineering, or agriculture degree to see its subject breakdown!*`
    };
  }

  // Faculty of Humanities and Social Sciences
  if (lowerMsg.includes('humanities') || lowerMsg.includes('hss') || lowerMsg.includes('social sciences')) {
    const hss = UNIZULU_FACULTIES.find(f => f.code === 'HSS');
    return {
      handled: true,
      source: 'Faculty of Humanities & Social Sciences (HSS) 2026 Handbook',
      text: `### 🌍 Faculty of Humanities and Social Sciences (HSS) 📚✨

• **Campus**: **KwaDlangezwa Main Campus**.
• **Overview**: Fosters critical thinking, social justice, cultural heritage, and human service professions with professional accreditation from the SACSSP.

#### 🎯 Key Academic Departments:
1. **Social Work**: Professional 4-Year Bachelor of Social Work (BSW) with integrated clinical fieldwork.
2. **Psychology**: Psychological theory, developmental psychology, psychopathology, and counselling.
3. **Communication Science**: Media studies, corporate communication, public relations, and journalism.
4. **Sociology & Development Studies**: Community development, social research, and policy analysis.
5. **Languages & Arts**: English, isiZulu, History, Philosophy, and Creative Arts.

#### 🎓 Flagship Undergraduate Programmes & Minimum APS:
• **Bachelor of Social Work (BSW)**: 4 Years • Minimum APS: **28 Points** (English 50%, SACSSP accredited) • CAO: \`ZU-M-SWK\`
• **BA in Psychology & Human Sciences**: 3 Years • Minimum APS: **26–28 Points** • CAO: \`ZU-M-BAP\`
• **BA in Communication Science**: 3 Years • Minimum APS: **26 Points** • CAO: \`ZU-M-BAC\`
• **BA in Development Studies**: 3 Years • Minimum APS: **26 Points** • CAO: \`ZU-M-BAD\`

💡 *Would you like to know more about the Social Work interview process or Psychology pathways?*`
    };
  }

  // Faculty of Education
  if (lowerMsg.includes('education') || lowerMsg.includes('edu') || lowerMsg.includes('teaching')) {
    const edu = UNIZULU_FACULTIES.find(f => f.code === 'EDU');
    return {
      handled: true,
      source: 'Faculty of Education (EDU) 2026 Prospectus',
      text: `### 🍎 Faculty of Education (EDU) 🏫✨

• **Campus**: **KwaDlangezwa Main Campus**.
• **Overview**: One of South Africa's foremost teacher training faculties, preparing knowledgeable, ethical, and inspiring educators for classrooms nationwide.

#### 🎯 Teaching Phases Offered:
1. **Foundation Phase Teaching (Grades R–3)**: Focuses on early childhood literacy, numeracy, life skills, and mother-tongue teaching.
2. **Intermediate Phase Teaching (Grades 4–7)**: Specializes in teaching mathematics, science, languages, and social sciences to young learners.
3. **Senior Phase & FET Teaching (Grades 8–12)**: Specializes in secondary school subject majors (e.g. Accounting, Business Studies, History, Geography, Mathematics, Physical Sciences, Life Sciences, English, isiZulu).

#### 🎓 Flagship Teacher Education Programmes & Minimum APS:
• **BEd in Foundation Phase Teaching**: 4 Years • Minimum APS: **26 Points** (English 50%, Maths Lit 50% or Pure Maths 40%) • CAO: \`ZU-M-EDF\`
• **BEd in Intermediate Phase Teaching**: 4 Years • Minimum APS: **26 Points** • CAO: \`ZU-M-EDI\`
• **BEd in Senior Phase & FET Teaching**: 4 Years • Minimum APS: **26 Points** (plus subject major prerequisites) • CAO: \`ZU-M-EDS\`

💡 *Note: The Postgraduate Certificate in Education (PGCE) is a postgraduate diploma; our undergraduate portal covers the 4-Year BEd degrees.*`
    };
  }

  return null;
}

/**
 * 3. Resolves Specific Degree / Programme Queries (e.g. triggered from clicking handbook cards)
 */
export function resolveSpecificDegreeQuery(userMessage: string): TargetedQueryResult | null {
  const lowerMsg = userMessage.toLowerCase().trim();

  // If this is a specific question (asks about APS, points, eligibility, requirements, maths, dates, campus, etc.),
  // DO NOT hijack with a static full-catalog dump! Let the AI model answer that particular question directly.
  const isQuestionOrSpecificAspect = (
    lowerMsg.includes('?') ||
    lowerMsg.startsWith('what') ||
    lowerMsg.startsWith('can i') ||
    lowerMsg.startsWith('do i') ||
    lowerMsg.startsWith('how') ||
    lowerMsg.startsWith('where') ||
    lowerMsg.startsWith('when') ||
    lowerMsg.startsWith('why') ||
    lowerMsg.startsWith('is ') ||
    lowerMsg.startsWith('does ') ||
    lowerMsg.includes('aps') ||
    lowerMsg.includes('score') ||
    lowerMsg.includes('points') ||
    lowerMsg.includes('qualify') ||
    lowerMsg.includes('eligible') ||
    lowerMsg.includes('maths lit') ||
    lowerMsg.includes('mathematical literacy') ||
    lowerMsg.includes('pure maths') ||
    lowerMsg.includes('closing date') ||
    lowerMsg.includes('deadline') ||
    lowerMsg.includes('fee') ||
    lowerMsg.includes('cost') ||
    lowerMsg.includes('career') ||
    lowerMsg.includes('job') ||
    lowerMsg.includes('fail') ||
    lowerMsg.includes('pass')
  );

  if (isQuestionOrSpecificAspect) {
    return null;
  }

  // Only trigger static degree catalog cards for explicit brochure requests or handbook button clicks
  const isExplicitBrochureRequest = (
    lowerMsg.startsWith('tell me about the degree') ||
    lowerMsg.startsWith('view degree profile') ||
    lowerMsg.startsWith('degree profile:') ||
    lowerMsg.startsWith('tell me about bachelor') ||
    lowerMsg.startsWith('tell me about diploma')
  );

  // Flatten all degrees with their parent faculty
  const allDegrees: Array<{ deg: FacultyDegree; faculty: FacultyDetail }> = [];
  UNIZULU_FACULTIES.forEach(fac => {
    fac.popularDegrees.forEach(deg => {
      allDegrees.push({ deg, faculty: fac });
    });
  });

  // 1. Exact title match (e.g. button click "Bachelor of Laws (LLB)")
  for (const { deg, faculty } of allDegrees) {
    const degTitleLower = deg.title.toLowerCase();
    const cleanTitle = degTitleLower.replace(/\(.*?\)/g, '').trim();

    if (lowerMsg === degTitleLower || lowerMsg === cleanTitle || (isExplicitBrochureRequest && lowerMsg.includes(cleanTitle))) {
      return {
        handled: true,
        source: `${faculty.name} Official 2026 Handbook`,
        text: formatSpecificDegreeResponse(deg, faculty)
      };
    }
  }

  // 2. Explicit handbook brochure queries
  if (lowerMsg === 'tell me about llb' || lowerMsg === 'tell me about bachelor of laws' || lowerMsg === 'view llb profile') {
    const llb = allDegrees.find(d => d.deg.title.includes('Bachelor of Laws (LLB)'));
    if (llb) return { handled: true, source: 'Faculty of Commerce, Administration and Law 2026', text: formatSpecificDegreeResponse(llb.deg, llb.faculty) };
  }

  return null;
}

/**
 * Format a single degree into a clean, dedicated response with zero unnecessary course dumps
 */
function formatSpecificDegreeResponse(deg: FacultyDegree, faculty: FacultyDetail): string {
  const campus = deg.campus || (deg.title.includes('Richards Bay') || (deg.caoCode && deg.caoCode.includes('-R-')) ? 'Richards Bay Campus' : 'KwaDlangezwa Main Campus');
  const qualType = deg.qualificationType || (deg.title.toLowerCase().includes('diploma') ? 'National Diploma' : deg.title.toLowerCase().includes('certificate') ? 'Certificate' : 'Bachelor\'s Degree');

  let text = `### 🎓 **${deg.title}** 🏛️✨\n\n`;
  text += `• **Faculty**: **${faculty.name}**\n`;
  text += `• **Campus**: **${campus}**\n`;
  text += `• **Qualification Type**: **${qualType}** (NQF Level ${deg.nqfLevel || (qualType.includes('Degree') ? '7/8' : '6')})\n`;
  text += `• **Minimum Duration**: **${deg.duration}** (Full-Time)\n`;
  text += `• **Minimum Required APS Score**: **${deg.minAps} Points**\n\n`;

  text += `📋 **Detailed Admission Requirements & Criteria:**\n`;
  text += `${deg.keyRequirements}\n\n`;

  text += `🏷️ **Application & Institutional Identifiers:**\n`;
  if (deg.caoCode) {
    text += `• **Central Applications Office (CAO) Code**: \`${deg.caoCode}\` (Select this code on www.cao.ac.za)\n`;
  }
  if (deg.unizuluCode) {
    text += `• **UNIZULU Internal Code**: \`${deg.unizuluCode}\`\n`;
  }
  if (deg.saqaId) {
    text += `• **SAQA Registration ID**: \`${deg.saqaId}\`\n`;
  }
  if (deg.totalCredits) {
    text += `• **Total SAQA Credits**: **${deg.totalCredits} Credits**\n`;
  }

  text += `\n💡 *Ready to apply? Applications are submitted via CAO at **www.cao.ac.za**. If you'd like to check your points against this degree, use our APS Calculator tab!*`;
  return text;
}

/**
 * 4. Resolves Particular Course / Module Queries (ONLY when explicitly asking for a single course or course code)
 */
export function resolveParticularCourseQuery(userMessage: string): TargetedQueryResult | null {
  const lower = userMessage.toLowerCase().trim();

  // If the query is actually about a degree or general admissions, DO NOT intercept here!
  if (
    lower.includes('bachelor of') ||
    lower.includes('diploma in') ||
    lower.includes('admission requirements') ||
    lower.includes('minimum aps') ||
    lower.includes('cao code') ||
    lower.includes('what can i study') ||
    lower.includes('how do i apply')
  ) {
    return null;
  }

  // 1. Direct Course Code (e.g. 2ACC101, 2LRC201, 2MGN101, 1SWK111)
  const codeMatch = lower.match(/\b([1-4][a-z]{3}[0-9]{3}[a-z]?)\b/i);
  if (codeMatch) {
    const targetCode = codeMatch[1].toUpperCase();
    const foundModule = HANDBOOK_MODULES.find(m => m.code.toUpperCase() === targetCode);
    if (foundModule) {
      return {
        handled: true,
        source: `Official UNIZULU 2026 Handbook (${foundModule.code})`,
        text: formatSingleCourseDetails(foundModule)
      };
    }
  }

  // 2. Specific Course by Name (e.g. "What is Accounting 1A?", "Tell me about Constitutional Law A", "Business Management 1B")
  const isAskingSpecificCourse = (
    lower.includes('what is') ||
    lower.includes('tell me about') ||
    lower.includes('syllabus for') ||
    lower.includes('prerequisites for') ||
    lower.includes('course info for') ||
    lower.includes('what do we learn in') ||
    lower.includes('information on')
  );

  if (isAskingSpecificCourse) {
    // Search exact module names
    for (const m of HANDBOOK_MODULES) {
      const mNameLower = m.name.toLowerCase();
      // Only match if at least 2 distinct words match or exact course title
      if (lower.includes(mNameLower) && mNameLower.length > 5) {
        return {
          handled: true,
          source: `Official UNIZULU 2026 Handbook (${m.code})`,
          text: formatSingleCourseDetails(m)
        };
      }
    }
  }

  return null;
}
