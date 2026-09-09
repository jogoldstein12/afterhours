import type { Metadata } from 'next';
import { LegalShell } from '@/components/shared/LegalShell';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy · After Hours',
  description: 'What After Hours stores, where it stores it, and what it never collects.',
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <p>
        This policy explains what After Hours does with information when you play.
        The short version: there are no accounts, we have no server that stores
        anything about you, and everything the game remembers stays on your own
        device.
      </p>

      <h2>What stays on your device</h2>
      <p>
        The game saves a small amount of data in your browser&rsquo;s local
        storage so it does not have to ask you the same things twice:
      </p>
      <ul>
        <li>the player names you typed and the game mode you last chose, so the same group can start again without retyping;</li>
        <li>the fact that you confirmed you are 18 or older.</li>
      </ul>
      <p>
        This never leaves your device and we cannot read it. Clearing your
        browser&rsquo;s site data for this site erases all of it permanently.
      </p>

      <h2>Player names appear in the address bar</h2>
      <p>
        While a game is running, the player names are part of the page URL. That
        means they are saved in your browser history and are visible to anyone
        who can see your screen or your history, and anyone you send the link to
        will see the names in it. Use nicknames if that matters to you, and take
        care when sharing a game link.
      </p>

      <h2>What we do not collect</h2>
      <ul>
        <li>No accounts, names, email addresses, or phone numbers.</li>
        <li>No advertising or tracking cookies, and no third-party ad networks.</li>
        <li>No location data.</li>
        <li>No record of which prompts you saw, skipped, or played.</li>
        <li>We never sell or share personal information, because we do not hold any.</li>
      </ul>

      <h2>Error reporting</h2>
      <p>
        If error reporting is enabled on this site, a crash may send technical
        diagnostic information — the error message, the page it happened on, and
        your browser type and version — to our error-monitoring provider so we
        can fix it. These reports are not used to identify you and are not
        combined with anything else. Before any report is sent we strip the
        query string from every URL in it, so the player names described above
        are never included.
      </p>

      <h2>Hosting</h2>
      <p>
        Our hosting provider processes standard web-server request logs,
        including IP addresses, for security and reliability. We do not use these
        logs to build any profile of you.
      </p>

      <h2>Children</h2>
      <p>
        After Hours is strictly for adults aged 18 and over. It is not directed
        at children and we do not knowingly collect information from anyone under
        18. If you believe a minor has used the game, contact us and we will help
        you clear any data held on that device.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct,
        delete, or export personal data held about you, and to object to its
        processing. Because we hold no personal data on any server, the practical
        way to exercise all of these is to clear this site&rsquo;s data in your
        browser, which removes everything the game has stored. If you would like
        confirmation of that in writing, or have any other request, contact us.
      </p>

      <h2>Offline version</h2>
      <p>
        The standalone <code>game.html</code> build runs entirely in your browser
        with no network connection required. It requests a font stylesheet from
        Google Fonts when online, which discloses your IP address to Google; it
        falls back to your system fonts offline and works exactly the same.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes we will update the &ldquo;last updated&rdquo; date
        at the top of this page.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions or requests: <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        The data controller is {LEGAL.entity}.
      </p>
    </LegalShell>
  );
}
