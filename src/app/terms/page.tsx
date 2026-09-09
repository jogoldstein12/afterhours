import type { Metadata } from 'next';
import { LegalShell } from '@/components/shared/LegalShell';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Terms of Service · After Hours',
  description: 'The terms you agree to when you play After Hours.',
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service">
      <p>
        These terms are an agreement between you and {LEGAL.entity} (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) covering your use of the After Hours party game and this
        website. By entering the site or playing the game, you accept them. If you
        do not accept them, please close the page.
      </p>

      <h2>1. You must be 18 or older</h2>
      <p>
        After Hours is an adults-only product containing explicit sexual content
        and strong language. You may use it only if you are at least 18 years
        old, or older where your local law sets a higher age of majority. We ask
        you to confirm this before the game loads. Misrepresenting your age is a
        breach of these terms.
      </p>

      <h2>2. The game is entertainment, and every prompt is optional</h2>
      <p>
        The game presents prompts, questions, and dares. Nothing it displays is
        an instruction you are obliged to follow. You may skip any prompt at any
        time, for any reason or none, and the game provides a Skip control for
        exactly that purpose.
      </p>
      <p>
        Many prompts involve other players. You are responsible for obtaining the
        freely given agreement of everyone involved before acting on any prompt
        that touches, involves, or names another person. Never pressure anyone,
        and stop immediately if anyone asks you to. A prompt naming a player is a
        suggestion to that group, never a permission.
      </p>

      <h2>3. Alcohol, physical activity, and your own judgement</h2>
      <p>
        Some prompts suggest drinking alcohol or performing physical dares. You
        take part entirely at your own risk and are solely responsible for your
        own safety and conduct and for complying with the law where you are.
      </p>
      <p>
        Do not drink if you are under the legal drinking age where you live,
        pregnant, driving or about to drive, taking medication that interacts
        with alcohol, or if you have any medical condition that makes drinking
        unsafe. Never drive after drinking. Drink water, know your limits, and
        stop when you want to. The game does not know anything about you, your
        health, or your tolerance, and its prompts are not tailored to you in any
        way.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the game with anyone under 18, or in a place where minors can see it;</li>
        <li>use it to harass, coerce, intimidate, or pressure anyone;</li>
        <li>photograph, record, or share images of any person without their clear agreement;</li>
        <li>use it for anything unlawful where you are;</li>
        <li>copy, resell, or redistribute the prompt deck or the software (see section 5).</li>
      </ul>

      <h2>5. Our content</h2>
      <p>
        The After Hours name, design, and prompt deck are owned by{' '}
        {LEGAL.entity} and protected by copyright. You get a personal,
        non-exclusive, non-transferable licence to use the game for your own
        private entertainment. You may not reproduce, republish, sell, or create
        derivative products from the deck without written permission.
      </p>

      <h2>6. No warranty</h2>
      <p>
        The game is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;,
        without warranties of any kind, express or implied, including any implied
        warranty of merchantability, fitness for a particular purpose, or
        non-infringement. We do not promise the service will be uninterrupted,
        error-free, or that any particular content will remain available.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {LEGAL.entity} will not be liable
        for any indirect, incidental, special, consequential, or punitive damages,
        or for any loss, injury, illness, embarrassment, damaged relationship, or
        harm of any kind arising out of your use of the game or anything you or
        anyone else chose to do while playing it. Our total liability to you for
        any claim relating to the game will not exceed the greater of the amount
        you paid us in the twelve months before the claim, or fifty US dollars.
      </p>
      <p>
        Nothing in these terms limits liability that cannot lawfully be limited,
        including liability for death or personal injury caused by negligence or
        for fraud. Some jurisdictions do not allow certain exclusions, so parts of
        this section may not apply to you.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms. When we do, we will change the &ldquo;last
        updated&rdquo; date at the top of this page. Continuing to use the game
        after a change means you accept the updated terms.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of {LEGAL.jurisdiction}, without
        regard to its conflict-of-laws rules. You and we agree to the exclusive
        jurisdiction of the courts located there.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </LegalShell>
  );
}
