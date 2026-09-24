import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/current-user";
import { Card, CardContent } from "@/components/ui/card";

interface ListItem {
  label: string;
  text: string;
  children?: ListItem[];
}

interface Block {
  type: "p" | "list";
  text?: string;
  ordered?: boolean;
  items?: ListItem[];
}

interface SectionData {
  title: string;
  blocks: Block[];
}

interface ArticleData {
  id: string;
  number: string;
  title: string;
  blocks?: Block[];
  sections?: SectionData[];
}

function p(text: string): Block {
  return { type: "p", text };
}

function list(items: ListItem[]): Block {
  return { type: "list", items };
}

const TOC: { id: string; label: string }[] = [
  { id: "preamble", label: "Preamble" },
  { id: "article-i--mission-and-purpose", label: "Article I – Mission and Purpose" },
  {
    id: "article-ii--official-fraternal-name-and-insignia",
    label: "Article II – Official Fraternal Name and Insignia",
  },
  { id: "article-iii--structure", label: "Article III – Structure" },
  { id: "article-iv--membership", label: "Article IV – Membership" },
  {
    id: "article-v--la-fraternidad-executive-board",
    label: "Article V – La Fraternidad Executive Board",
  },
  { id: "article-vi--chapter", label: "Article VI – Chapter" },
  { id: "article-vii--amendments", label: "Article VII – Amendments" },
  { id: "article-viii--ratification", label: "Article VIII – Ratification" },
  { id: "article-ix--finances", label: "Article IX – Finances" },
  { id: "article-x--university-compliance", label: "Article X – University Compliance" },
];

const PREAMBLE_PARAGRAPHS = [
  "We, the Brothers of the Beta Alpha Chapter of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc. have consummated this Fraternity in the Latino tradition and spirit of pride, dignity, and equality. Our affirmation of respect, and admiration for our respective cultures, now united as one noble brotherhood, is proclaimed to all through our thoughts, efforts, and conduct.",
  "This constitution, created by the brotherhood, sets the structure of our organization and stipulates the basic principles and standards that will enable the fraternity to work diligently for the advancement and enhancement of the quality of education for all underrepresented groups. By striving to enlarge the ranks of Latinos and others within the student body and the faculty, and by providing one another with the moral and academic support necessary for accomplishing our accepted responsibilities as students in an institution of higher learning, we strive to serve as the models for, and the link to, ultimate equality.",
  "Therefore, with the guidance and the undeviating direction of the preamble, constitution, and bylaws, the Beta Alpha Chapter of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc. shall henceforth continue the progress onward with the highest of honorable intentions and motives, and in doing so, will contribute not only to the betterment of each individual brother but also to improve the general welfare of all humanity.",
];

const ARTICLES: ArticleData[] = [
  {
    id: "article-i--mission-and-purpose",
    number: "Article I",
    title: "Mission and Purpose",
    sections: [
      {
        title: "Section 1: Mission Statement",
        blocks: [
          p("We are a fraternal service organization aimed at bringing men together in Brotherhood and uniting to serve the Latino community."),
        ],
      },
      {
        title: "Section 2: Motto",
        blocks: [
          p('La Fraternidad shall bear the motto, "La Unidad Para Siempre". The use of the motto is privilege granted only to Caballeros and Hermanos.'),
        ],
      },
      {
        title: "Section 3: Purpose",
        blocks: [
          p("It is the purpose of La Fraternidad to further the best interests of the chapter through representation at Old Dominion University and the greater community of Norfolk, VA, as well as through an active interest in matters of common concern. The Beta Alpha Chapter shall concentrate on our national philanthropy, Providing Access to Higher Education (P.A.T.H.E.) Initiative, while working with its members in an on-going effort to:"),
          list([
            { label: "a.", text: "Serve as the governing body of students approved for membership within La Unidad Latina, Lambda Upsilon Lambda Fraternity, Incorporated at the Old Dominion University – Norfolk, VA." },
            { label: "b.", text: "Provide access to higher education for all underrepresented peoples, specifically those of Hispanic/Latino descent." },
            { label: "c.", text: "Educate and support the University and Norfolk, VA diverse communities on the current and emerging expressions of Hispanic/Latino identity." },
            { label: "d.", text: "Advocate for issues pertinent to the Hispanic/Latino community, including, but not limited to, an increase in the number of Hispanic/Latino undergraduate students, graduate students, administrators and faculty members here at Old Dominion University." },
            { label: "e.", text: "Support and coordinate events with other constituent organizations based on Hispanic/Latino identity." },
            { label: "f.", text: "Support and coordinate events with other constituent organizations of the Multi-Cultural Greek Council (MGC), Inter-Fraternity Council (IFC), the Pan Hellenic Association (PHA), and the National Pan-Hellenic Council (NPHC)." },
            { label: "g.", text: "Promote the fraternal ideals of scholarship, service, leadership, culture, and brotherhood." },
            { label: "h.", text: "Serve as a liaison for La Fraternidad within the Multi-Cultural Greek Council, Hispanic/Latino descent-based communities, other Greek organizations at Old Dominion University, all student organization, the student body, the university administration and faculty, and the local Norfolk, VA community." },
          ]),
        ],
      },
      {
        title: "Section 4: Non-Discrimination Clause",
        blocks: [
          p("La Fraternidad will not discriminate on the basis of race, ethnicity, color, creed, sex, sexual orientation, gender identity or expression, national origin, age, religion, disability, or any other classification as provided by law. Members of La Fraternidad who have been successfully inducted cannot have their membership deactivated, canceled, revoked, or otherwise altered on the grounds of current or future gender identification."),
        ],
      },
    ],
  },
  {
    id: "article-ii--official-fraternal-name-and-insignia",
    number: "Article II",
    title: "Official Fraternal Name and Insignia",
    sections: [
      {
        title: "Section 1: Name",
        blocks: [
          p('The name of the chartered chapter of the fraternal corporation shall be the "Beta Alpha Chapter of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc." and hereinafter referred to as "La Fraternidad". It is a registered student organization at Old Dominion University under "Fraternal organization".'),
        ],
      },
      {
        title: "Section 2: Colors",
        blocks: [
          p("The Official Fraternal Colors are Brown, Gold, White, and Red. Brown and Gold are the Primary Colors; White and Red are the Secondary Colors."),
        ],
      },
      {
        title: "Section 3: Crest",
        blocks: [
          p("The Official Crest of La Fraternidad shall be (see below). The Insignia may not be altered, defaced or modified. This Insignia shall be used in the official representation of La Fraternidad according to the standards stipulated by national corporation regulations."),
        ],
      },
      {
        title: "Section 4: Symbol",
        blocks: [
          p("The Official Symbol of La Fraternidad shall be (see below). The Insignia may not be altered, defaced or modified. This Insignia shall be used in the official representation of La Fraternidad according to the standards stipulated by national corporation regulations."),
        ],
      },
    ],
  },
  {
    id: "article-iii--structure",
    number: "Article III",
    title: "Structure",
    sections: [
      {
        title: "Section 1: Affiliation",
        blocks: [
          p("The term affiliation refers to any individual or organization that bears any of the rights or responsibilities conferred upon a Chapter or an Hermano as designated in the Constitution. La Fraternidad shall not affiliate with other fraternities, sororities, religious, or political organizations. Due to possible conflicts of interest that may arise between the Chapters, the Beta Alpha Chapter will not affiliate itself with other fraternities, sororities, religious or political organizations."),
        ],
      },
      {
        title: "Section 2: Governing Documents",
        blocks: [
          p("The Governing Documents of La Fraternidad, while maintaining regulation set forth by the national corporation, shall consist of the Chapter's Preamble, Constitution, and Bylaws."),
        ],
      },
      {
        title: "Section 3: Powers",
        blocks: [
          p("The powers of La Fraternidad are as followed:"),
          list([
            { label: "a.", text: "To formulate any rules necessary to regulate all organizational matters," },
            { label: "b.", text: "To administer and enforce the constitution, bylaws, and rules and regulations established by the chapter, national corporation, and Old Dominion University's Office of Fraternity and Sorority Life," },
            { label: "c.", text: "To enact bylaws and to amend them, and" },
            { label: "d.", text: "To adopt resolution, offer suggestions and enact policies for the organization that make up La Fraternidad." },
          ]),
        ],
      },
      {
        title: "Section 4: Scope of Authority",
        blocks: [
          list([
            { label: "a.", text: "The scope of authority for La Fraternidad shall be legislative, administrative, and advisory." },
            { label: "b.", text: "By virtue of the authority vested in it by this constitution and by-laws, the members shall have the power to regulate all matters of organizational interest, except those that are set by the national corporation and university level with the ability to submit recommendations." },
            {
              label: "c.",
              text: "The Beta Alpha Chapter operates in accordance with the policies of the following organizations:",
              children: [
                { label: "i.", text: "The National Association of Latino Fraternal Organizations" },
                { label: "ii.", text: "The National Council of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc." },
                { label: "iii.", text: "The DMV Regional Board of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc." },
                { label: "iv.", text: "The Office of Fraternity and Sorority Life, Division of Student Affairs of Old Dominion University" },
                { label: "v.", text: "The Multi-Cultural Greek Council (MGC) of Old Dominion University." },
              ],
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "article-iv--membership",
    number: "Article IV",
    title: "Membership",
    sections: [
      {
        title: "Section 1: Qualifications",
        blocks: [
          p("All members of La Fraternidad shall be recognized as Hermanos of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc. In order to qualify for membership, an individual cannot be a member of another social fraternity and must:"),
          list([
            { label: "a.", text: "Be enrolled as a full-time and good standing student at Old Dominion University with a minimum grade point average of 2.8" },
            { label: "b.", text: "However, for second semester freshman the minimum grade point average must be at least 3.0 on a 4.0 scale" },
            { label: "c.", text: "Be a gentleman of great character and esteem who has dedicated his life to fulfilling accomplishments in concurrence with the values of La Fraternidad, and" },
            { label: "d.", text: "Be an interested gentleman of La Fraternidad and complete all necessary interest requirements prior to intake" },
            { label: "e.", text: "Be approved by the National Council of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc. and the Office of Fraternity and Sorority Life of Old Dominion University." },
            { label: "f.", text: "Be able to complete the New Member Education (N.M.E.)" },
          ]),
        ],
      },
      {
        title: "Section 2: New Member Education (N.M.E.)",
        blocks: [
          p("The New Member Education (N.M.E.) shall be run in accordance with the guidelines set forth by both the DMV Regional Board and the National Council of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Incorporated in either a fall or spring semester. The Beta Alpha Chapter shall abide by Old Dominion University's campus code of student conduct in implementing the N.M.E. at the University. Caballeros shall be made aware of the governing bodies for their intake process prior to the beginning of the process."),
        ],
      },
      {
        title: "Section 3: Classes",
        blocks: [
          p("There shall be two (2) classes of Hermanos: Campus and Alumni. Campus Hermanos are those still enrolled at Old Dominion University and Alumni Hermanos are those who have graduated."),
        ],
      },
      {
        title: "Section 4: Titles",
        blocks: [p("Members shall bear one of two titles: Neophyte or Prophyte.")],
      },
      {
        title: "Section 5: Status",
        blocks: [
          p("All Hermanos shall fall into one (1) of four (4) status categories: Active, Inactive, Excused, or Suspended."),
          list([
            {
              label: "a.",
              text: "Active Members – Any campus Hermano that has met all of the aforementioned responsibilities for eligibility shall be considered an active Hermano of the Beta Alpha Chapter with all of the rights, responsibilities and privileges that come with bearing the title of Hermano de la Fraternidad. To achieve active status as an Hermano de La Fraternidad of the Beta Alpha Chapter, a campus Hermano must:",
              children: [
                {
                  label: "i.",
                  text: "Maintain an overall G.P.A. of 2.5 on a 4.0 scale",
                  children: [
                    { label: "i.", text: "Academic probation shall occur when a semester grade point average falls below a 2.5 listed under Article 3 of the bylaws" },
                    { label: "ii.", text: "Deactivation shall occur if two consecutive semester grade point averages fall below a 2.5 on a 4.0 scale" },
                  ],
                },
                { label: "ii.", text: "Pay membership dues to the Beta Alpha Chapter (every semester)." },
                { label: "iii.", text: "Pay membership dues to the Multi-Cultural Greek Council (every semester)." },
                { label: "iv.", text: "Pay membership dues to the national organization of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Incorporated (every year)." },
                { label: "v.", text: "Remain in good standing with the Multi-Cultural Greek Council." },
                { label: "vi.", text: "Remain in good standing with Old Dominion University." },
                { label: "vii.", text: "Remain in good standing with the DMV Regional Board of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc." },
                { label: "viii.", text: "Remain in good standing with the National Council of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc." },
                { label: "ix.", text: "Must hold one event per academic year." },
              ],
            },
            { label: "b.", text: "Inactive Members – Any campus Hermano that has not met any of the aforementioned responsibilities for eligibility in Article IV, Section 4, Part a. of the Constitution shall be considered an inactive Hermano. All rights, responsibilities and privileges of active status shall be withheld until the campus Hermano has either met all of those responsibilities or has graduated from Old Dominion University, whichever comes first. Active status is determined at the beginning of each fall and spring semester and can be rescinded if:", children: [
              { label: "i.", text: "The overall G.P.A. is lower than a 2.5 on a 4.0 scale." },
              { label: "ii.", text: "Any mandatory membership fees/dues have not been paid." },
              { label: "iii.", text: "An undergraduate Hermano has not remained in good standing with the Beta Alpha Chapter, the Multi-Cultural Greek Council, Old Dominion University, the DMV Regional Board or the National Council of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Inc." },
              { label: "iv.", text: "The Chapter Advisor determines that it is in the best interest of the undergraduate Hermano to be qualified as an inactive Hermano (on a per semester basis only)." },
            ] },
            { label: "c.", text: "Excused Members – Any Hermano wishing to terminate their membership within the Beta Alpha Chapter should present their case to the Executive Board in accordance with its By-laws. Written notification must be given to the Executive Board one month prior to their planned presentation to the Beta Alpha Chapter, and prior to their public announcement." },
            { label: "d.", text: "Suspended Members – In the event that the Beta Alpha Chapter sees the need to revoke an undergraduate Hermano's membership, the Executive Board must first notify the individual in question, and then present the case to the rest of the organization in a process mediated by either the University Advisor to the Beta Alpha Chapter, the DMV Regional Board of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Incorporated or the National Council of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Incorporated." },
          ]),
        ],
      },
    ],
  },
  {
    id: "article-v--la-fraternidad-executive-board",
    number: "Article V",
    title: "La Fraternidad Executive Board",
    sections: [
      {
        title: "Section 1: Executive Board",
        blocks: [
          p("The officers of La Fraternidad Executive Board shall be: President, Vice President, Treasurer, Secretary, Parliamentarian, Director of Academic Affairs, Direction of Public Relations, Director of Programming, Director of Philanthropy, Director of Recruitment, Director of Alumni Relations, Director of New Member Education, Alumni Advisor and University-Chapter Advisor(s). See La Fraternidad Bylaws Article 1 for duties and description. The Executive Board shall be subject in all circumstances to La Fraternidad."),
        ],
      },
      {
        title: "Section 2: Limitation",
        blocks: [
          p("An active member may not hold more than two (2) positions on the Executive Board given the number of active members."),
        ],
      },
    ],
  },
  {
    id: "article-vi--chapter",
    number: "Article VI",
    title: "Chapter",
    sections: [
      {
        title: "Section 1: Recorder",
        blocks: [
          p("In order for regular business to be conducted, Chapter must meet the following criteria:"),
          list([
            { label: "a.", text: "The President and Secretary or their designated replacements must be on hand to officially run and record the meeting." },
          ]),
        ],
      },
      {
        title: "Section 2: Chapter Meetings",
        blocks: [
          list([
            { label: "a.", text: "La Fraternidad shall meet weekly at such time and place is agreed to by the general consensus." },
            { label: "b.", text: "The President may call an emergency chapter meeting with 48 hours advanced notice via phone and email." },
          ]),
        ],
      },
      {
        title: "Section 3: Attendance",
        blocks: [
          list([
            { label: "a.", text: "The Secretary and Parliamentarian shall take attendance at the beginning of each meeting." },
            { label: "b.", text: "Only 2 excused absences will be allowed during each semester. An excused absence will be accepted with a 24-hour notice via the chapter's current communication platform, provided Officer's report, and completed tasks. Members leaving early and arriving late must seek approval by the Parliamentarian." },
            { label: "c.", text: "This and emergencies will be determined by the Parliamentarian." },
            {
              label: "d.",
              text: "Unexcused Absences based on the academic semester will be disciplined as followed:",
              children: [
                { label: "i.", text: "1st offense: Warning" },
                { label: "ii.", text: "2nd offense: $5 Fine" },
                { label: "iii.", text: "3rd offense: $10 Fine" },
                { label: "iv.", text: "4th offense: $20 Fine" },
                { label: "v.", text: "5th offense: Removal of officer position and placed on social probation from any chapter sponsored events." },
                { label: "vi.", text: "6th offense: At the discretion of the chapter." },
              ],
            },
            { label: "e.", text: "Each member is required to attend Chapter Meetings." },
            {
              label: "f.",
              text: "Chapter Sponsored Events: All events sponsored EXCLUSIVELY by the Beta Alpha Chapter are mandatory for all active Hermanos. Exceptions can be pardoned if submitted to the President and Parliamentarian for approval up to twenty-four hours prior to the event.",
              children: [
                { label: "i.", text: "PATHE is mandatory for all active Hermanos and excused absence requests must be submitted and approved by the chapter meeting prior to the event, so that all shifts can be covered." },
              ],
            },
          ]),
        ],
      },
      {
        title: "Section 4: Tardiness",
        blocks: [
          list([
            { label: "a.", text: "An Hermano will be considered tardy after **** have been recited. Chapter will always begin at the agreed upon time. Chapter meetings will not be delayed for late arrivals of any Hermano." },
            {
              label: "b.",
              text: "Unexcused Tardiness based on the academic semester will be disciplined as followed:",
              children: [
                { label: "i.", text: "1st Offense: Warning" },
                { label: "ii.", text: "2nd Offense: $5 Fine" },
                { label: "iii.", text: "3rd Offense: $10 Fine" },
                { label: "iv.", text: "4th Offense: $15 Fine" },
                { label: "v.", text: "5th Offense: At the discretion of the Chapter" },
              ],
            },
          ]),
        ],
      },
      {
        title: "Section 5: Deliberate Work Neglect",
        blocks: [
          list([
            { label: "a.", text: "An Hermano who feels that another Hermano is deliberately neglecting work shall formally inform the Parliamentarian and President via email. The Parliamentarian shall reach out to the said Hermano for documentation on excusable validation (see Section 4 of this Article) on why they are not able to complete their task. If unable to, the Parliamentarian shall note the said Hermano has neglected work." },
            {
              label: "b.",
              text: "Hermanos will be disciplined if chapter work is not completed by the given due date:",
              children: [
                { label: "a.", text: "All offenses can be appealed per Article 6, Section 1 in the bylaws." },
              ],
            },
            {
              label: "c.",
              text: "Deliberate Work Neglect based on the academic semester will be disciplined as followed:",
              children: [
                { label: "i.", text: "1st Offense: Warning" },
                { label: "ii.", text: "2nd Offense: $5 Fine" },
                { label: "iii.", text: "3rd Offense: $10 Fine" },
                { label: "iv.", text: "4th Offense: $15 Fine" },
                { label: "v.", text: "5th Offense: At the discretion of the Chapter" },
              ],
            },
          ]),
        ],
      },
      {
        title: "Section 6: Valid Excusable Documentation",
        blocks: [
          p("Excuses will be deemed valid by the parliamentarian for the following reasons:"),
          list([
            { label: "a.", text: "Academic obligation: Group meeting, meeting with faculty member, class, exam – does NOT include writing papers, submitting an assignment, or any other project to which advance notice was given. Please plan accordingly." },
            { label: "b.", text: "Professional obligation: Job interview, career-related travel, presentation of research, conference, lecture, workshop, etc." },
            { label: "c.", text: "Work: Please communicate accordingly with chapter and your employer to schedule work around chapter meeting times." },
            { label: "d.", text: "Illness: This will be based on the honor system." },
            { label: "e.", text: "Act of God: Death in the family, car accident, weather emergency, delayed flight, etc. Please provide the President and Parliamentarian proof of such an event within 1 week of absence." },
          ]),
        ],
      },
      {
        title: "Section 7: Opening/Closing of Meetings",
        blocks: [
          list([{ label: "a.", text: "All Hermanos shall recite the ***** before roll call." }]),
        ],
      },
      {
        title: "Section 8: Dress Code",
        blocks: [
          list([
            { label: "a.", text: "All Hermanos are expected to dress business casual." },
            { label: "b.", text: "The following is not permitted: tennis shoes, jeans, t-shirts, hoodies, casual wear." },
            { label: "c.", text: "If an Hermano will be showing up late to chapter or right at the beginning of chapter due to his class or work schedule, he will be excused from dressing up for chapter with prior notification to the Parliamentarian." },
            {
              label: "d.",
              text: "Dress Code Violations based on the academic semester will be disciplined as followed:",
              children: [
                { label: "i.", text: "1st Offense: Warning" },
                { label: "ii.", text: "2nd Offense: Warning" },
                { label: "iii.", text: "3rd Offense: Warning" },
                { label: "iv.", text: "4th Offense: $5 fine each time after that" },
              ],
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "article-vii--amendments",
    number: "Article VII",
    title: "Amendments",
    sections: [
      {
        title: "Section 1: Quorum",
        blocks: [p("This Constitution shall be amended by a 2/3 vote of delegates present and voting at any Chapter.")],
      },
      {
        title: "Section 2: Sponsors",
        blocks: [p("Amendments may be proposed by: reference from a previous Chapter, the Executive Board, and affiliated active Hermanos.")],
      },
      {
        title: "Section 3: Presentation",
        blocks: [p("All proposed amendments must be brought up during new business and voted at the following the chapter. Voting may occur during old business at the next meeting of the chapter.")],
      },
    ],
  },
  {
    id: "article-viii--ratification",
    number: "Article VIII",
    title: "Ratification",
    sections: [
      {
        title: "Section 1: Ratification",
        blocks: [
          p("This constitution and bylaws shall be in effect upon ratification, which shall require a three-fourths vote of the Governing Board. The articles shall bind all members of the Beta Alpha Chapter of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Incorporated to this constitution and bylaws upon ratification. The Parliamentarian shall be responsible for all matters and execution of the Beta Alpha Chapter's rules and regulations."),
        ],
      },
    ],
  },
  {
    id: "article-ix--finances",
    number: "Article IX",
    title: "Finances",
    sections: [
      {
        title: "Section 1: Chapter Dues",
        blocks: [
          list([
            { label: "1.", text: "National Dues will be determined by the National Council and must be paid by each member before October 31st of each Fiscal Year. As of now, National Dues are set at $300." },
            {
              label: "2.",
              text: "Chapter Dues will be decided upon per Academic Year by a plurality vote at the first chapter meeting of the Academic Year. Chapter Dues will be paid at the beginning of the third Chapter Meeting of each Academic Year.",
              children: [
                { label: "a.", text: "If Chapter Dues are not paid by the third Chapter Meeting of each Academic Year, a $10 fine will be instituted." },
              ],
            },
            { label: "3.", text: "Hermanos are able to request fee waivers and ask for assistance with covering dues if facing economic hardship." },
          ]),
        ],
      },
      {
        title: "Section 2: Fines",
        blocks: [
          list([
            { label: "1.", text: "Fines carried out by the chapter in accordance with the constitution shall be paid out to the primary chapter monetary account held by the President and Treasurer." },
            {
              label: "2.",
              text: "Fines must be paid within two weeks of receiving notice of the fine.",
              children: [
                { label: "a.", text: "If the Hermano fined does not pay it within the time limit without reasonable excuse (that must be communicated 48 hours prior to the due date to the President or Treasurer), the Hermano will be fined an additional $5 and given another week to pay the total fine." },
                { label: "b.", text: "If it is not paid within four weeks of initial offense, the Hermano will be considered for suspension." },
              ],
            },
          ]),
        ],
      },
      {
        title: "Section 3: Monetary Accounts",
        blocks: [
          list([
            {
              label: "1.",
              text: "Monetary and bank accounts of the chapter shall have the President and Treasurer as signees who will be responsible for safekeeping the debit and credit cards of the Chapter. They will hold signatory authority.",
              children: [
                { label: "a.", text: "All expenses must be documented by the Treasurer and each semester, a report will be drafted by the Hermano in said position to let the Chapter know how the finances are being spent." },
              ],
            },
          ]),
        ],
      },
      {
        title: "Section 4: Treasurer Duties",
        blocks: [
          p("The Treasurer shall have charge of all monetary responsibilities for the organization and will disburse funds on proper authorization of the organization's officers. The Treasurer will maintain a treasurer's ledger with all receipts, disbursements, and current balances, and will be generally accountable for the fiscal solvency of the organization. The Treasurer's duties include:"),
          list([
            { label: "i.", text: "Manage all Chapter finances and monetary accounts." },
            {
              label: "ii.",
              text: "Provide an itemized budget for the Academic Year through a shared Google Drive spreadsheet, covering:",
              children: [
                { label: "1.", text: "Master Budget" },
                { label: "2.", text: "P.A.T.H.E." },
                { label: "3.", text: "Chapter Hermano Budget, including Chapter Due Allocation" },
                { label: "4.", text: "Alumni Contributions, including Alumni Allocation" },
              ],
            },
            { label: "iii.", text: "Responsible for submitting all reimbursement forms, which must include a receipt or credit card statement." },
            { label: "iv.", text: "Responsible for submission of sponsorship forms." },
            { label: "v.", text: "Responsible for keeping record of all invoices and creating a semesterly report on spending." },
            {
              label: "vi.",
              text: "Fundraising:",
              children: [
                { label: "1.", text: "Works directly with the Director of Programming and Director of Philanthropy to set up fundraising events for the Chapter." },
                { label: "2.", text: "Responsible for organizing one fundraising event a month to increase Chapter funds." },
                { label: "3.", text: "Finds potential sponsors for major events hosted by the Chapter." },
                { label: "4.", text: "Organizes two fundraising events a year, at least one local and one for P.A.T.H.E., to raise money for philanthropy." },
              ],
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "article-x--university-compliance",
    number: "Article X",
    title: "University Compliance",
    sections: [
      {
        title: "Section 1: Compliance Statement",
        blocks: [
          p("Statement of University Compliance: This organization shall comply with all Old Dominion University regulations, and local, state, and federal laws."),
          list([
            { label: "a.", text: "Anti-Hazing Policy: Hazing is strictly prohibited. Hazing shall be defined as any conduct which subjects another person, whether physically, mentally, emotionally, or psychologically, to anything that may endanger, abuse, degrade, or intimidate the person as a condition of association with a group or organization, regardless of the person's consent or lack of consent." },
            { label: "b.", text: "Personal Gain Clause: This organization, if raising funds shall ethically raise and distribute profits from organizational functions to either the organization or to members who provide a service that directly benefits the organization. Individual members may not receive compensation from for-profit companies if acting as a representative of a student organization." },
          ]),
        ],
      },
    ],
  },
];

function ListItemView({ item }: { item: ListItem }) {
  return (
    <li className="flex gap-2">
      <span className="w-6 shrink-0 font-medium text-muted-foreground">{item.label}</span>
      <div className="flex flex-1 flex-col gap-2">
        <p>{item.text}</p>
        {item.children && (
          <ul className="flex flex-col gap-2 pl-4">
            {item.children.map((child, i) => (
              <ListItemView key={i} item={child} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.type === "p") {
    return <p>{block.text}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {block.items!.map((item, i) => (
        <ListItemView key={i} item={item} />
      ))}
    </ul>
  );
}

export default async function ChapterConstitutionPage() {
  const currentUser = await requireCurrentUser();
  if (currentUser.role !== "alumni") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Chapter Constitution
        </h1>
        <p className="text-sm text-muted-foreground">
          The governing document for the Beta Alpha chapter.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 py-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
            Table of Contents
          </h2>
          <ol className="flex flex-col gap-1 text-sm">
            {TOC.map((entry, i) => (
              <li key={entry.id}>
                <a href={`#${entry.id}`} className="text-foreground hover:text-primary hover:underline">
                  {i + 1}. {entry.label}
                </a>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 text-sm leading-relaxed">
          <div id="preamble" className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-bold text-primary">Preamble</h2>
            <p className="font-semibold">Beta Alpha Chapter at Old Dominion University – Norfolk, VA</p>
            <p className="font-semibold">Preamble Statement</p>
            {PREAMBLE_PARAGRAPHS.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>

          {ARTICLES.map((article) => (
            <div key={article.id} id={article.id} className="flex flex-col gap-4 border-t border-border pt-6">
              <h2 className="font-heading text-lg font-bold text-primary">
                {article.number} – {article.title}
              </h2>
              {article.blocks?.map((block, i) => (
                <BlockView key={i} block={block} />
              ))}
              {article.sections?.map((section) => (
                <div key={section.title} className="flex flex-col gap-2">
                  <h3 className="font-heading text-sm font-bold">{section.title}</h3>
                  {section.blocks.map((block, i) => (
                    <BlockView key={i} block={block} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
