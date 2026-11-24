import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import DocLangSwitch from '../DocLangSwitch'
import '../DocPage.css'

// 영어판 이용약관. 한국어판(TermsPage.jsx)을 고칠 때 이 파일도 같은 내용으로 함께 고치고 날짜를 맞춘다.
const SECTIONS = [
  {
    heading: '1. About the Service',
    body: 'Chiyumi (the "Bot") is a Discord bot that provides the following features in Discord servers: verification; games using Chiyumi Coins, a virtual currency (gambling-style mini games and rock-paper-scissors); a virtual stock market traded with Chiyumi Coins; a bank with deposits and loans; levels and rankings based on chat and voice activity; League of Legends and VALORANT match history lookup; profanity, spam and raid filtering; a warning system; join/leave notifications; announcements; tickets; a virtual pet; a Korean word-chain game; AI chat; weather, precipitation radar, earthquake and typhoon information; stream notifications; chat cleanup; and inquiries, reports and feedback. All features of the Bot can only be used inside Discord servers where the Bot is installed. They cannot be used in DMs (direct messages) or through a user-account install.',
  },
  {
    heading: '2. Consent',
    body: 'The first time you use a Bot command, you are shown a notice asking you to agree to these Terms and the Privacy Policy. Pressing the "동의하기" (Agree) button means you agree to these Terms and the Privacy Policy in full, after which you can use all features.',
  },
  {
    heading: '3. Conditions of Use',
    node: (
      <p>
        By using the Bot, you agree to comply with Discord&apos;s{' '}
        <a href="https://discord.com/terms" target="_blank" rel="noreferrer">Terms of Service</a> and{' '}
        <a href="https://discord.com/guidelines" target="_blank" rel="noreferrer">Community Guidelines</a>.
      </p>
    ),
  },
  {
    heading: '4. Chiyumi Coins and Games',
    body: 'Chiyumi Coins are a virtual currency that cannot be exchanged for real money. They can only be used in features inside servers, such as /도박 (games: slot machine, odd-or-even, number guessing, blackjack, rock-paper-scissors), /주식 (buying and selling virtual stocks) and /은행 (deposits, withdrawals and loan repayment). You can receive Chiyumi Coins and experience points with the /출석 (attendance) command. Chiyumi Coins are given once a day per account, and experience points can be received once a day separately in each server. The operator may reset or adjust coin balances without prior notice.',
  },
  {
    heading: '5. Levels and Rankings',
    body: 'Experience points are earned through chat and voice channel activity and /출석 (attendance). Experience, levels and time spent in voice channels are tracked separately for each server. Chiyumi Coins are tracked per account across all servers (global). With the /순위 (ranking) command you can see a card image with your level and rank in that server, and chat and voice rankings limited to current members of that server. Level-up notifications are only sent in servers where a server administrator has turned them on with the /레벨업알림설정 command. In the same settings panel, administrators can turn notifications off or choose the channel (or the channel where the level-up happened) and the message. Servers that had already set a notification channel or message before this feature changed keep notifications turned on.',
  },
  {
    heading: '6. Join/Leave Notifications',
    body: 'When a server administrator sets it up in /입퇴장, the Bot sends a custom message to the channel chosen by the administrator when a member joins or leaves the server. The join channel and the leave channel can be set separately. If they are not set separately, notifications are sent to a shared channel.',
  },
  {
    heading: '7. Match History Lookup',
    body: 'The /전적검색 (stats) command sends the Riot ID entered by the user to Riot Games\' official API for League of Legends, and to HenrikDev API, an unofficial stats service, for VALORANT, to look up match history. VALORANT agent, map and rank names and icons are loaded from valorant-api.com. League of Legends champion names and icons are loaded from Riot Games\' Data Dragon. Search results are visible only to the user who searched, and only a match for which the user presses "채널에 공유" (Share to channel) is posted publicly in that channel. Because VALORANT stats go through an unofficial service, they may be temporarily unavailable or differ from the actual data depending on that service. This feature is not an official Riot Games product and does not reflect the views or opinions of Riot Games. League of Legends, VALORANT and Riot Games are trademarks or registered trademarks of Riot Games, Inc.',
  },
  {
    heading: '8. Profanity, Spam and Raid Filtering',
    body: 'When a server administrator turns it on in /검열 or /로그, the Bot automatically checks all chat in that server, deletes messages judged to be profanity or spam repeated in a short time, and records them in the configured log channel. Profanity filtering and spam filtering can be turned on and off separately, and spam filtering sensitivity can be set from level 1 to 5.\n\nWhen raid filtering is on and 5 or more members with the same nickname join the server within 10 seconds, the Bot treats it as a raid, automatically blocks sending messages in all channels and pauses the server\'s invite links. When a raid is detected, an alert is recorded in the administrator alert channel and the channel set in /로그, and a notice for server members is sent to the channel used by /공지. When a server administrator clears the alert in /검열, the channel lock and the invite pause are lifted together. Depending on the settings, members who joined during the raid can be automatically kicked or banned.',
  },
  {
    heading: '9. Warning System',
    body: 'Server administrators can add, view, cancel and reset warnings for members with the /경고 command. Administrators can set penalties in advance for each warning count, such as giving a role, mute (timeout), kick or permanent ban, and the penalty is applied automatically according to those settings when a warning is given. If a maximum warning count is set, the member is permanently banned automatically when it is reached. Warning history is stored per server.',
  },
  {
    heading: '10. Inquiries, Reports and Feedback',
    body: 'Reports, feedback and bug reports submitted with the /문의 command (author, server name, server address and content) are delivered to a channel designated by the operator.',
  },
  {
    heading: '11. Tickets',
    body: 'When a server administrator sets a channel and message in /티켓 and posts it, users can create a private thread with the "티켓 생성" (Create ticket) button. The thread can only be seen by the user who created the ticket and users with management permissions in that server. Inside the thread, administrator-only functions are provided: add a user, close (remove view access for non-administrators), save the conversation as a text file, and delete.',
  },
  {
    heading: '12. Virtual Pet',
    body: 'With the /키우기 command you can raise a virtual cat. Feeding, washing and playing can each be done once a day, and each result succeeds or fails by chance. The cat\'s growth stage is based on the real time passed since the day you first used the feature, and this data is tracked per account across all servers.',
  },
  {
    heading: '13. Stocks',
    body: 'With the /주식 command you can trade shares of virtual companies from the Chiyumi universe using Chiyumi Coins. Prices change automatically every day at midnight (KST), and no profit or loss is guaranteed. Shares are held per account across all servers. The operator may reset or adjust prices and stock data without prior notice.',
  },
  {
    heading: '14. Bank',
    body: 'With the /은행 command you can deposit Chiyumi Coins or take out a loan. Deposits automatically earn 1% interest every day at midnight. Only one loan can be held at a time, and loans accrue 5% compound interest every day at midnight. The maximum loan is 50,000 coins, and interest must be paid together with the principal when repaying. If your total assets (wallet coins + deposits + value of held shares) are less than the amount needed to repay, you can declare bankruptcy. On bankruptcy, wallet coins are reset to the starting amount and all deposits, loans and held shares are removed. After bankruptcy, the number of rebirths is recorded. The operator may reset bank data or adjust interest rates without prior notice.',
  },
  {
    heading: '15. Word-Chain Game',
    body: 'When a server administrator sets a channel in /끝말잇기, users can gather a party in that channel and play the Korean word-chain game. The game takes place in a thread, and Chiyumi also joins as a player. A player who does not enter a valid word within the time limit is eliminated, and the thread is deleted automatically some time after the game ends. Words are judged by the word-chain rules (the first letter must match the previous word\'s last letter, no repeated words) and by whether the word is listed in the National Institute of Korean Language\'s Urimalsaem dictionary.',
  },
  {
    heading: '16. Weather, Radar, Earthquakes and Typhoons',
    body: 'When you ask about the weather in a chat message together with a city name, the Bot sends the location coordinates of that city to the Open-Meteo weather API and air quality API (or, when the weather API is down, the MET Norway API of the Norwegian Meteorological Institute) to look up temperature, feels-like temperature, humidity, chance of precipitation, wind speed and fine dust (PM2.5), and shows the result. Precipitation radar images are composed from tile data from the Korea Meteorological Administration API or the RainViewer service. Earthquake information shows earthquakes around the Korean Peninsula over the last 30 days from the USGS (United States Geological Survey) API and the Korea Meteorological Administration\'s earthquake information service. Typhoon information looks up currently active typhoons in NOAA\'s (U.S. National Oceanic and Atmospheric Administration) IBTrACS data and shows their location and expected track on a map. The base maps for radar, earthquake and typhoon maps are drawn by the Bot from Natural Earth public map data. City names entered for these features are used only for the lookup and are not stored.',
  },
  {
    heading: '17. AI Chat',
    body: 'When a chat message starts with "유미야", the Bot processes the message through Groq\'s AI API and replies, but only in channels designated by a server administrator with the /유미채널설정 command (up to 25 channels, including threads inside them). If Groq is down or its quota is used up, the message is passed to the OpenRouter and Mistral AI APIs in that order. AI replies are generated based on a preset personality and speaking style and are AI-generated output, not content written by the Bot\'s operator. Conversation context is kept temporarily in memory only, per channel and per user, and is reset when the Bot restarts. To manage free API quotas, users other than the developer can use AI chat up to 5 times per minute. AI chat cannot be used in a server until an administrator designates a channel. If called in a channel that is not designated, the Bot tells the user which channels are available or where to ask instead of replying.\n\nUsers can save information as a permanent memory with the "유미야 기억해 [content]" command (up to 10 items, unlimited for the developer), and these memories are automatically used in later AI chats. Memories can be managed with the "유미야 기억 목록·삭제·수정·모두 삭제" (list, delete, edit, delete all) commands, and memory data is stored permanently in Supabase.',
  },
  {
    heading: '18. Stream Notifications',
    body: 'When a server administrator registers a YouTube, CHZZK or SOOP streamer channel in /방송알림, the Bot checks each platform\'s public pages and public APIs about every 5 minutes for a stream going live or a new video upload, and sends a notification with the message and mentions set by the administrator to the channel chosen by the administrator. Registered channel information and notification settings are stored per server, together with recently checked video IDs so the same video is not announced twice. YouTube upload notifications are sent only for regular videos and Shorts. Live streams and their replays are excluded from upload notifications, and premiere videos are announced after they are published. A stream notification is sent only once when a stream goes from offline to live, and is not sent again when a stream briefly drops and comes back or when a platform lookup temporarily fails. YouTube channels are stored by their unique channel ID so notifications continue even if the handle (@name) changes. Test notifications from the management panel do not trigger mentions.',
  },
  {
    heading: '19. Chat Cleanup',
    body: 'Users with the Manage Messages permission can delete up to 100 recent messages in the current channel at once with /채팅청소. Messages older than 14 days are deleted one at a time because of Discord limits, so this can take longer. Deleted messages cannot be recovered.',
  },
  {
    heading: '20. Paid Service (Bot Profile Customization)',
    body: 'Users with the Manage Server permission are guided by the /봇프로필 command to the "봇 프로필" (Bot profile) page in the fehe.dev server dashboard, where they can change the Bot\'s name (server nickname), profile picture, banner and bio as shown only in that server. This feature can only be used in servers with a paid pass, which is provided per server in monthly periods and granted by the operator. Payment methods, prices and refund rules will be announced separately in these Terms and on the information page when payment is introduced. When the pass expires, the Bot automatically returns to its default profile.\n\nYou may not use names or images that impersonate Discord or any other person, group or official account; obscene, violent or hateful content; images that infringe others\' copyright or portrait rights; or content that violates Discord\'s Terms of Service or the law. The operator may, without prior notice, return such settings to the default profile or suspend the server\'s pass. Because the changed profile is shown as-is on Discord in that server, the server administrator who set it is responsible for the uploaded images and text.',
  },
  {
    heading: '21. Restrictions',
    body: 'The Bot\'s operator (developer) may restrict a specific user\'s use of the Bot without prior notice if a violation of these Terms, abuse or misuse is found. A restricted user cannot use any feature of the Bot.',
  },
  {
    heading: '22. Limitation of Liability',
    body: 'The Bot is provided free of charge, and the operator does not guarantee its availability or accuracy. The operator is not responsible for any damage resulting from use of the Bot.',
  },
  {
    heading: '23. Changes to These Terms',
    body: 'These Terms may change without prior notice. Changed Terms apply from the time they are posted on this page.',
  },
  {
    heading: '24. Contact',
    node: (
      <p>
        For questions, please contact <a href="mailto:help@fehe.dev">help@fehe.dev</a>.
      </p>
    ),
  },
]

export default function TermsPageEn() {
  useDocumentTitle('Terms of Service', 'Chiyumi')

  return (
    <div className="doc-page" lang="en">
      <DocLangSwitch current="en" koPath="/DiscordBot/Chiyumi/terms" enPath="/DiscordBot/Chiyumi/terms/en" />
      <p className="eyebrow">Legal</p>
      <h1 className="doc-title">Chiyumi Terms of Service</h1>
      <p className="doc-date">Last updated: 2026-11-24</p>
      <p className="doc-intro">
        This is an English translation of the Korean Terms of Service. Command names are shown in Korean as they
        appear in Discord. If the two versions differ, the Korean version prevails.
      </p>

      {SECTIONS.map((section) => (
        <section key={section.heading} className="doc-section">
          <h2>{section.heading}</h2>
          {section.node
            ? section.node
            : section.body.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
        </section>
      ))}
    </div>
  )
}
