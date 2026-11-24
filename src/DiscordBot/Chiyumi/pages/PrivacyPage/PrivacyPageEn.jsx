import { useDocumentTitle } from '../../../../hooks/useDocumentTitle'
import DocLangSwitch from '../DocLangSwitch'
import '../DocPage.css'

// 영어판 개인정보 처리방침. 한국어판(PrivacyPage.jsx)을 고칠 때 이 파일도 같은 내용으로 함께 고치고 날짜를 맞춘다.
const COLLECTED_ITEMS = [
  'Discord user ID (unique identifier)',
  'Chiyumi Coin balance and attendance history (coins are given once a day per account; experience is given once a day per server)',
  'Name, adoption date, status values and last care date of the virtual cat raised with /키우기 (tracked per account across all servers)',
  'Experience, level and time spent in voice channels earned through chat and voice activity and /출석 (tracked separately per server)',
  'Whether you agreed to the Terms of Service and when',
  'Settings made by server administrators: join/leave notification channels (join and leave separately) and messages; whether level-up notifications are on, their channel and message; ticket channel and message; word-chain channel; warning system settings (log channel, maximum warning count, roles and penalties per warning count); raid filtering settings (on/off, administrator alert channel, notice channel, lock mode, automatic action)',
  'Warnings given by server administrators with /경고 (target user ID, reason, ID of the administrator in charge, time given) — stored per server',
  'Virtual stocks and quantities held through /주식 (stored per account across all servers)',
  'Deposit balance, loan principal, accrued interest and loan date, and bankruptcy history (number of rebirths) in /은행 (stored per account across all servers)',
  'If a server administrator turns on profanity or spam filtering: the author, channel and content of deleted messages (sent only to the configured log channel, not stored permanently)',
  'If a server administrator turns on raid filtering: the user IDs and tags of members who joined when a raid was detected (sent only to the administrator alert channel and log channel, not stored permanently)',
  'Reports, feedback and bug reports submitted with /문의 (author, server name, server address, content)',
  'For chat messages starting with "유미야": channel ID, speaker\'s user ID, Discord display name and message content — sent to the Groq API (or, if it is down, the OpenRouter and Mistral AI APIs) to generate an AI reply. Conversation context per channel and user is kept temporarily in memory only and is reset when the Bot restarts',
  'Memories saved with "유미야 기억해" — stored permanently in Supabase per account and automatically used in later AI chats (up to 10 items, unlimited for the developer)',
  'For users restricted by the operator: user ID, reason, time of restriction and the operator who applied it',
  'Stream notification settings registered by server administrators with /방송알림 (platform; streamer channel link, ID and name; notification message; mention settings; notification channel; whether the stream is live and the count of offline checks; recent video IDs to prevent duplicate notifications and IDs of videos waiting to be published; a record of sent notifications kept for 30 days (notification, video and stream IDs and the time sent)) — stored per server',
  'Paid pass information (server ID, server name, product, start date, end date or permanent status, and a note with the name of the operator who granted, extended or cancelled it and the date) and bot profile setting records (server ID, server name, the name and bio set, whether a profile picture or banner is set, status, ID of the administrator who last changed it, time changed) — stored in a private Google Sheet owned by the operator. Uploaded profile pictures and banner images are sent directly to Discord and are not stored by us',
  'Number of online members per server (only the count of online members excluding bots, updated every 2 minutes, with the last 24 hours kept at 30-minute intervals; who was online is not stored)',
]

const USAGE_ITEMS = [
  'Managing Chiyumi Coin balances (viewing, giving, betting)',
  'Counting experience and voice time for levels and rankings, and creating card images',
  'Managing growth stages and status of the virtual cat',
  'Sending join/leave notifications, posting the ticket button and creating ticket threads',
  'Gathering parties and running word-chain games (party members and game progress are kept in memory only and deleted when the game ends)',
  'Buying and selling stocks and managing portfolios',
  'Bank deposits, withdrawals, loans and interest',
  'Checking whether you agreed to the Terms of Service',
  'Deleting messages and writing administrator logs for profanity/spam filtering',
  'Automatic channel lock, invite pause, alerts and logs for raid filtering',
  'Managing the warning system (adding, cancelling and resetting warnings, and automatically giving roles or applying mute, kick and ban according to warning rules)',
  'Looking up match history for the stats feature',
  'Delivering reports, feedback and bug reports to the operator',
  'Restricting Bot use for users who violate the Terms or abuse the Bot',
  'Generating AI chat replies and keeping conversation context',
  'Checking for streams going live and new videos, and sending stream notifications',
  'Showing the number of online members on the management page',
  'Checking paid passes, applying per-server bot profiles and restoring the default profile when a pass expires',
]

export default function PrivacyPageEn() {
  useDocumentTitle('Privacy Policy', 'Chiyumi')

  return (
    <div className="doc-page" lang="en">
      <DocLangSwitch current="en" koPath="/DiscordBot/Chiyumi/privacy" enPath="/DiscordBot/Chiyumi/privacy/en" />
      <p className="eyebrow">Legal</p>
      <h1 className="doc-title">Chiyumi Privacy Policy</h1>
      <p className="doc-date">Last updated: 2026-11-24</p>
      <p className="doc-intro">
        This is an English translation of the Korean Privacy Policy. Command names are shown in Korean as they appear
        in Discord. If the two versions differ, the Korean version prevails.
      </p>

      <section className="doc-section">
        <h2>1. Information We Collect</h2>
        <p>Chiyumi (the &quot;Bot&quot;) collects and stores the following information.</p>
        <ul>
          {COLLECTED_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>When you use the weather feature, the city name you enter is converted into that city&apos;s location coordinates and used only to query the Open-Meteo weather and air quality APIs (or, if the weather API is down, the MET Norway API of the Norwegian Meteorological Institute). It is not stored. Precipitation radar images use data from the Korea Meteorological Administration API or the RainViewer service and contain no personal information. The earthquake feature uses the USGS (United States Geological Survey) API and the Korea Meteorological Administration&apos;s earthquake information service and collects no user data.</p>
        <p>The Riot ID (gameName#tagLine) you enter in /전적검색 (stats) is used only to look up match history (Riot Games API for League of Legends, HenrikDev API for VALORANT). Lookup results are kept temporarily in memory for up to 10 minutes and then deleted automatically.</p>
        <p>When you use the /순위 (ranking) command, your Discord profile picture is loaded from the Discord CDN to create the card image. It is not stored.</p>
        <p>Except as described above, the Bot does not collect any other personal information, such as nicknames or ordinary message content (unless it is subject to profanity/spam filtering).</p>
      </section>

      <section className="doc-section">
        <h2>2. How We Use Information</h2>
        <p>Collected information is used only for the following purposes.</p>
        <ul>
          {USAGE_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="doc-section">
        <h2>3. Sharing with Third Parties</h2>
        <p>The Riot ID you enter in /전적검색 (stats) is sent to Riot Games&apos; API servers (League of Legends) or HenrikDev API servers (VALORANT) to look up match history. VALORANT agent, map and rank names and icons are loaded from valorant-api.com, and League of Legends champion names and icons from Riot Games&apos; Data Dragon; these requests contain no user information. Words entered in /끝말잇기 (word chain) are sent to the National Institute of Korean Language&apos;s Urimalsaem API servers to check whether they are in the dictionary. AI chat messages starting with &quot;유미야&quot; are sent to Groq (GroqCloud) API servers to generate a reply. If Groq is down, the same content is sent to the OpenRouter and Mistral AI API servers in that order. The location coordinates of the city you enter for the weather feature are sent to Open-Meteo API servers (or, if the weather API is down, MET Norway API servers) to look up weather and air quality. Precipitation radar images request tile data from the Korea Meteorological Administration API or the RainViewer service. Earthquake information is requested from the USGS API servers and the Korea Meteorological Administration&apos;s earthquake information service, and typhoon information from NOAA&apos;s IBTrACS data servers; these requests contain no user information. To check streamer channels registered in /방송알림, requests are made with that channel&apos;s information to the public pages and public APIs of YouTube, CHZZK and SOOP. The name, bio and images entered in bot profile customization are sent to Discord API servers to apply them to the Bot’s profile in that server. If the operator has set up Google Sheets integration for backup and operations, the data listed in section 1 (Discord user ID, coins, levels, virtual pet data, etc.) is periodically backed up to a private Google Sheet managed by the operator. No other information is provided or sold to third parties.</p>
      </section>

      <section className="doc-section">
        <h2>4. Storage and Location</h2>
        <p>Data is kept in local storage (JSON files) on the server where the Bot runs, and match history lookup results are kept only in memory for up to 10 minutes. Data saved with the AI memory feature (&quot;유미야 기억해&quot;) is stored in Supabase (Supabase Inc.). If Google Sheets backup is set up, a copy of the same data is also kept in a private Google Sheet owned by the operator. Paid passes and bot profile setting records are kept in a private Google Sheet owned by the operator.</p>
      </section>

      <section className="doc-section">
        <h2>5. Deleting Your Information</h2>
        <p>You can ask a server administrator or the operator to delete your data.</p>
      </section>

      <section className="doc-section">
        <h2>6. Changes to This Policy</h2>
        <p>This Policy may change without prior notice. Changes apply from the time they are posted on this page.</p>
      </section>

      <section className="doc-section">
        <h2>7. Contact</h2>
        <p>For questions, please contact <a href="mailto:help@fehe.dev">help@fehe.dev</a>.</p>
      </section>
    </div>
  )
}
