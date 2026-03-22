// Full essay content
const articles = {
  'il9cast-postmortem': {
    title: "IL9Cast Post-Mortem: What We Got Right, and What the Markets Saw First",
    date: 'March 22, 2026',
    readTime: '5 min read',
    body: `
      <p>The IL-9 Democratic primary is over. Daniel Biss won. And on most of the numbers that mattered, IL9Cast got it right.</p>

      <p>That's the short version. The longer version is more interesting, because the two separate models I ran told different stories at different points in the campaign, and looking at how each one performed is the most instructive thing I can take away from the whole project.</p>

      <h2>What IL9Cast Was</h2>

      <p>IL9Cast was a forecasting site for the Illinois 9th Congressional District Democratic primary, which took place on March 17, 2026. The district, anchored in Evanston and the North Shore, was an open seat after Jan Schakowsky's retirement, and it drew a crowded field of 16 candidates. I built and published two completely separate models: one based purely on prediction market probabilities (primarily Kalshi and Manifold), and one based purely on fundamentals (fundraising, endorsements, structural factors). They never fed into each other. The site updated daily and showed each model's probability estimates side by side.</p>

      <p>I launched in January 2026, roughly two months out from election day. By then Biss, Kat Abughazaleh, and Laura Fine had separated themselves from the rest of the field on fundraising. The prediction markets were thin but present. Polls were sparse.</p>

      <h2>The Fundamentals Model</h2>

      <p>The fundamentals model was built entirely on fundraising totals, endorsement weight, and structural factors like name recognition and prior electoral history. It forecast vote shares for the top three candidates within a percentage point of the final results for the winner, and was close across the board for the top three. Biss finished at 29.5%, Abughazaleh at 25.9%, Fine at 20.2%. That's a level of accuracy I'm genuinely proud of, especially given how little reliable polling there was to work with in a low-salience primary.</p>

      <p>What it captured well was Biss's structural dominance: the endorsement from Schakowsky herself, the fundraising lead, the name recognition from his prior statewide runs. In a primary electorate that skews toward party-engaged voters, those factors matter enormously, and the model reflected that from early on.</p>

      <p>Where it was less reliable was in accounting for late momentum. Fundamentals models are by nature backward-looking. They're better at telling you where a race has been than where it's going in the final stretch.</p>

      <h2>The Prediction Markets Model</h2>

      <p>The markets model ran completely independently, ingesting raw contract prices from Kalshi and Manifold and converting them to probability estimates daily. It told a more dynamic story. In the weeks before March 17th, it showed Biss consolidating support, with his probability climbing steadily and peaking above 80% in the hours just before polls closed. That late-breaking signal reflected something real: voters making up their minds, undecideds breaking toward the frontrunner, the classic late consolidation pattern in primaries with one established candidate.</p>

      <p>The markets caught the momentum that the fundamentals model couldn't see. Each one had something the other lacked: fundamentals gave you the structural baseline, markets gave you the live pulse. Running them separately made the contrast legible in a way that combining them would have obscured.</p>

      <h2>What I'd Do Differently</h2>

      <p>A few things stand out in retrospect. First, liquidity. Prediction markets for a congressional primary in a single Illinois district are thin. On some days, total open interest on the key contracts was low enough that a small number of traders could move prices meaningfully. I tried to account for this with a liquidity-weighting function in the markets model, but in a future version I'd want to be more aggressive about discounting low-volume days, and building in a credibility interval that widens as liquidity drops.</p>

      <p>Second, the polling gap. There were stretches of the campaign where we had almost no polling to work with. In a primary with a more robust polling environment, both models would have had better calibration inputs, and the uncertainty bands would have been more meaningful. Finding ways to incorporate quasi-polling signals (social media engagement, search volume, canvassing data) could partially fill that gap in future low-poll environments.</p>

      <p>Third, and most honestly: I underestimated how much the Schakowsky endorsement of Biss would move late-deciding voters. It was in the fundamentals model, but its marginal impact in the final two weeks was larger than I'd weighted. That's a calibration issue worth revisiting.</p>

      <h2>An Election Worth Remembering</h2>

      <p>Beyond the numbers, this was just a genuinely interesting race to cover. A competitive, high-quality field in a district that cares deeply about governance, in a cycle where the national stakes felt unusually high. The Evanstonian coverage, the VoteHub briefings, the FOIAgras guest post, the Capitol Fax citations, all of it was a reminder that local forecasting, done carefully, has an audience.</p>

      <p>IL9Cast was a proof of concept. The model worked. The next version will be better.</p>
    `
  },
  'peoples-edict': {
    title: "People's Edict",
    date: 'May 23, 2025',
    readTime: '5 min read',
    body: `
      <p><em>I wrote an interesting on-demand essay in English on power and strife. This is what I came up with in 50 minutes. Not pure gold, but it resonates.</em></p>

      <p>Authority is inherently meant to be challenged. Since the dawn of time, power struggles have transcended not only humans but also the most basic of animals. However, for such a primal topic, it has been fraught with various philosophies and theses on how to govern while allowing the populace to have agency over themselves and their decisions. Authority was created to centralize decision-making. It has existed in many forms as the world has evolved: the leader of the tribe, the king, and now the head of state, all having to balance on a tightrope of power and public approval. Without much of either, the leader tends to, well, not lead. Nevertheless, people have both the right and the will to challenge authority they deem unjust; the question is when to do so. Instead of writing a philosophical and motivational thesis, I believe we must be pragmatic about challenging authority. Authority should be challenged only when it is both a necessity and, more importantly, achievable. While opposition to a force larger than ourselves may seem the moral and right thing to do, one should only challenge authority when they believe change is either imminent or attainable.</p>

      <p>This claim, a pragmatic approach to opposition, is most exhaustively demonstrated in "Raisin in the Sun." During a time of great strife and burden for Black homeownership, the Youngers could have organized a movement at the federal level to outlaw redlining, a far bigger accomplishment than anything they achieved in the book. The protest would have been noble; however, the Youngers realized that the most effective way to challenge authority was to stay and fight the battle they could win. By fighting this small battle in a tight-knit neighbourhood, they presumably helped the narrative of Black homeownership. In this way, they were successful, while Karl Linder was not nearly the tip of the spear; they understood what was within the scope of their abilities and challenged the preconceived, illogical notions about Black homeownership, albeit in a small but significant way.</p>

      <p>This "fight when you can win" strategy is not only effective in literature; it has real applications to real-life authority. My research project, focused on voter turnout in low-propensity Black neighbourhoods, which presents an enormous challenge in the US; however, the resources and infrastructure required to effect change at a state or nationwide level are immense. Consequently, I attempted to change something at a more achievable level, where challenging authority and policy is much more feasible. Throughout the project, I spoke with mayoral candidates and aldermen who appeared receptive, if not interested, in my idea. While challenging authority was not the core of the project, the narrative of "figuring out a winnable fight" and challenging authority only when necessary is central to the research I conducted.</p>

      <p>Lastly, and in all truthfulness, my least relevant or persuasive piece of evidence comes from "Romeo and Juliet." While they do challenge authority and nearly succeed, the story ends in heartbreak. The challenge to the wealthiest and most influential individuals results in the death of the two lovers, both opposing the omnipotent authority of their parents. Although fictional, the tale illustrates what occurs in real life when individuals blindly attack authority: death and bloodshed, ultimately empowering the leader to persist, the antithesis of the original goal of those who opposed them.</p>

      <p>These stories both present cautionary tales and ideal models for opposing authority. They suggest that, when necessary and applicable, authority should be questioned. This thesis provides an unparalleled application to modern life; with battles over power raging throughout the world, the question of when to oppose authority is not merely theoretical or meant to be taught in a classroom, but is relevant to the lives and deaths of millions.</p>
    `
  },
  'median-voter-theory': {
    title: "The Conflation Between Median Voter Theory and Trump's Win",
    date: 'January 8, 2025',
    readTime: '6 min read',
    body: `
      <p><strong>How the Trump Campaign Used an Obscure Political Science Concept to Move the Electorate</strong></p>

      <p><em>By: Ryan J. McComb</em></p>

      <p>In the aftermath of the election, a wave of analysis has swept through the Democratic Party and political pundits alike. The reasoning spans from Democratic rancour over Biden's resignation to the lack of time and preparation that the Harris campaign had at its disposal. However, unlike its predecessors, this election was shaped by a concept older than the United States itself.</p>

      <p>The term Median Voter Theory was coined by Duncan Black in the mid-1900s and refers to the idea that in a first-past-the-post (plurality voting) system, a "Median Voter" would decide the election. However hypothetical, this voter would represent the collective opinion of the country's policy positions. Due in part to the obscurity of the concept, it is commonly misconceived that the "voter" would split policy positions evenly down the middle. For much of U.S. policy, they would—or come close. However, on issues like abortion or immigration, their "median" view might lean left or right of centre, respectively. This dynamic often forces major party candidates to adopt policy and rhetoric that is often far different or antithetical to primary policy in order to appeal to a wider range of voters in a national election.</p>

      <h2>The Strategic Exploitation</h2>

      <p>In this election, the Trump campaign identified a unique opportunity to tactically exploit Median Voter Theory in action: leveraging Kamala Harris' 2020 bid for president to position her as out of touch with the "median voter." The first few weeks of the "switch" were a tumultuous time for both campaigns. On one side, the Trump team scrambled to create media and strategy for the new opponent. On the other side, the Democratic campaign underwent upheaval, creating entirely new media and advertisements solely for publicity. While both efforts generated effective publicity for their respective campaigns (albeit a bit differently), Harris' pre-existing favourability challenges suggest deeper issues.</p>

      <p>Examining her public perception before the ticket change reveals a critical vulnerability that shaped the election's trajectory.</p>

      <p>Almost immediately after inauguration, her favourability began to slip into the negatives, slowly rising and plateauing at a remarkable 17.4 points underwater. Unlike Trump<sup>1</sup>, who maintained a −10 point favourability for a while coming into the election<sup>2</sup>, Harris had nearly three years for her discontent to marinate throughout the American people. This was not fully unexpected; Vice Presidents take much more blame and much less credit proportionally than their dynamic counterparts<sup>3</sup>. Her declining favourability reflected both short-term events and long-term perceptions. While discontent with the administration—particularly following the Afghanistan withdrawal—played a role, a more enduring factor was the public's lingering impression of her lackluster showing and progressive policies during the 2020 primaries<sup>4</sup>.</p>

      <p>In 2020, she was an extremely different candidate than the one she tried to be in 2024. All credit given, you need different pieces of policy that will win you a primary. However, on the stage, she was far left. With this being her first exposure to the broader American public, she did see a temporary bump due to the partisan nature of her messaging in the primaries and the impending election, where few Democratic voters would say that she was an unfavourable choice. Even so, her policies soured among much of her Democratic contingent as well.</p>

      <h2>Running with the Data</h2>

      <p>Armed with the same data that is at the press of a few buttons on your laptop, the Trump campaign took it and ran. They pushed out tens of millions of dollars' worth of advertisements just playing and capitalising upon clips of town halls and debates during her primary process. One of the key harangues was "Kamala is for They/Them," capitalising upon comments made during her run in the primaries and early in her tenure.</p>

      <p>This wasn't accidental. Reinforcing the messages (especially anti-trans sentiments that have become a slight advantage for the Republicans) that were said to win a primary had a very different effect on an already polarised electorate. Remember, the median voter types tend to match the quintessentially fought-over "swing voters." Reinforcing an already advantageous message to a group of people with quasi-malleable opinions was a great strategy. While Median Voter Theory does lack a spatial awareness<sup>5</sup> of the issues presented (basically how much the issues matter, and to whom), it does model voting in a relatively realistic fashion. Even though it was subliminal, Trump mentioned her tax policy (something of paramount importance to voters) while focusing upon her extreme stances on trans-sports and trans-rights.</p>

      <h2>The Culmination</h2>

      <p>A culmination of the advertisement as aforementioned, along with countless others, propelled a win among the "swingiest" groups—notably Latinos. Using the already marinated national image and clips from her primary run, Trump and his contingent pushed Harris just far enough from the median in many of her policies to get the votes from the crucial swing voters. This was only made easier by many of the preconceived notions that Harris had left voters with during her first national run.</p>

      <p>To visualise this, let's suppose that tax policy opinions tend to lean liberal among the public. We can demonstrate what a few advertisements and some old policy choices (made to win a primary) would do to a voter's opinion of the candidates on the issue.</p>

      <p>Albeit a crude image, you can see that with a bit of reestablishment of some unfavourable policy choices, Trump is able to win that specific category among the "median voter." Inherently, you have to win many categories, but some stand out. Trump mainly attacked Harris on her far-left policy in regards to the border and some of her proposals for where to spend tax dollars that is germane to the economy in voting<sup>6</sup>. Seeing as these categories play outsized roles in the electorate<sup>7</sup>, a blanket of ads over every issue was not necessary.</p>

      <h2>Looking Back</h2>

      <p>With all of that said, it has to be remembered that no one candidate loses due to one, two, or even three factors. In Harris' case, her semi-extreme policy positions from the 2020 election seem to have stuck with the voter. Additionally, all politicians go through some type of primary process and stray to the partisans (to whom they are rightfully appealing). However, candidates that are threatened by previous words tend to be running for president<sup>8</sup>, inherently giving a chance to change policy directly after the primaries. Nevertheless, Harris' case presents a uniqueness unseen before; her policy from her first national appearances was just ripe enough for remembrance while also being far enough from the present for attack advertisements from the Trump Team to fill in the blanks on her "policy goals."</p>

      <p>Could this have been avoided? Maybe. Even a primary process would have likely crowned her as heir apparent; however, she would have been given years, not weeks, to establish herself on the national stage and push back and reestablish her brand state-by-state. How would she have acquired more time? Just as so many post-mortems have said, Biden should have ceded; it all comes back to the big man in the end.</p>

      <hr>

      <p><sup>1</sup> Even with his mercurial nature, he managed to keep his approval relatively the same throughout the election cycle.</p>
      <p><sup>2</sup> He now sits at close to 0, with an official rating of −0.3. This is well within the margin of error, so it's basically a wash.</p>
      <p><sup>3</sup> <a href="https://www.pbs.org/wgbh/americanexperience/features/american-vice-president-evolving-vice-presidency">PBS – The Evolving Vice Presidency</a></p>
      <p><sup>4</sup> <a href="https://www.vox.com/2019/11/20/20953284/kamala-harris-polls-2020-election">Vox – Kamala Harris Polls, 2020 Election</a></p>
      <p><sup>5</sup> <a href="https://en.wikipedia.org/wiki/Spatial_voting">Wikipedia – Spatial Voting</a></p>
      <p><sup>6</sup> <a href="https://www.pewresearch.org/global/2024/03/13/economic-and-policy-changes/">Pew Research – Economic and Policy Changes</a></p>
      <p><sup>7</sup> <a href="https://www.pewresearch.org/politics/2024/09/09/issues-and-the-2024-election/">Pew Research – Issues and the 2024 Election</a></p>
      <p><sup>8</sup> Given that the others don't need to worry because they tend to be on the sidelines, or behind presidential policy, not running for office.</p>
    `
  },
  'nsa-surveillance': {
    title: "Resolution on State Interception of Communications: Notwithstanding National Security",
    date: 'September 29, 2024',
    readTime: '7 min read',
    body: `
      <p><em>I wrote this essay in eighth grade, so the quality may be subpar.</em></p>

      <p>In an age where digital technology permeates every facet of modern life, the issue of government surveillance has emerged as a contentious battleground between national security imperatives and individual (and constitutional) privacy rights. At the forefront of this debate stands the National Security Agency (NSA), a governmental body entrusted with the formidable task of safeguarding the nation against foreign and domestic threats. It is a good bet these days that almost anyone has some internet-enabled, message-capable device on them at all times. When messages are sent through these devices, people expect them to be secure, and, for all intents and purposes, they are. Although secure, in recent times, operations run by the NSA, respectively PRISM, XKeyscore, and Upstream have been intercepting vast quantities of communications metadata from US citizens. However, there is a strong possibility that the NSA has picked up text messages or calls from most US citizens through FISA (Foreign Intelligence Surveillance Act) or an NSL (National Security Letter). Even while enticing for national security, the intentional censorship and oversight of personal and private-enterprise communications without an official warrant is not only immoral but outright unconstitutional. The staggering amount of precedent and stare decisis demonstrates the necessity of private communications in personal and enterprise environments.</p>

      <p>Even though debate and argument can be helpful and get discourse far, legal precedence is indubitably the most powerful and compelling to initiate change. Since our nation's inception, privacy has been a central credo of our laws and doctrine. The quantity of doctrine of judicial precedent is unrivalled in almost any other constitutional law debate. EO (Executive Order) 12333 proclaims that intel agencies are "restricted in collecting intelligence information against US citizens" and require warrants to tap or collect data. Sadly, after the "Patriot Act" was put in place, many of these liberties started to crumble. NSLs (National Security Letters) can let FBI agents obtain personal and private-enterprise information without a warrant from a judge. These actions were unequivocally and unmistakably unconstitutional. These measures spurred some insiders to release a plethora of damning documents to the public, which included the specifications of the surveillance effort in the public realm. Some subsections of the Patriot Act were repealed and declared unconstitutional because "the FBI had no probable cause to issue NSLs." In the end, these so-called NSLs captured only one suspected terrorist. Additionally, the NSL was only used to corroborate evidence, not to catch the aforementioned terrorist actively. As illustrated in this paragraph, this surveillance is not only illegal but useless, with worse-than-dismal results.</p>

      <p>The second tenet on which this argument is based is regarding public interest. As we live in a democracy, the state has the obligation to act in the people's best interests. According to a recent AP poll, only 28% of people support the interception of foreign communications. This poll paints a glaring picture that the national appetite to cease government surveillance is growing exponentially compared to after 9/11. The citizens ought to reflect on how Orwellian this society is to be before it takes that form permanently. Even while shielded from public oversight, both the President and inspector general oversee the capacity of the agencies responsible for digital communications metadata. The President appoints a National Security Advisor who advises the President and the Joint Chiefs on the actions of intelligence agencies (domestic, US Department of Homeland Security, and FBI (Federal Bureau of Investigation), or foreign, DIA (Defence Intelligence Agency), CIA (Central Intelligence Agency), and NSA (National Security Agency). The Inspector General can also oversee budgets, among other intelligence duties. Sadly, the reason Americans could not respond to this Orwellian threat was because, well, it was classified. The documents were classified so highly that most people working on active clandestine surveillance did not even know what data they were collecting. The only reason that Edward Snowden could acquire and disseminate the documents was because he was a systems engineer for a CIA contractor. He had tremendous and relatively unprecedented oversight over many files that he and only a few others had ever seen. He had seen so much over his tenure that in his book, he remarks about how once the FBI realized it was him and searched his house, they were going to be scared, not because they knew what Snowden was going to distribute but because he could disseminate every damaging national security document authored in the past ten years. It should not take a person who has to flee to Russia to inform citizens of what is happening to them; it should be a relatively public policy decision not of the state but of the citizens.</p>

      <p>While the Patriot Act did have good intentions, it was overzealous and thought up by people who were non-compos mentis. The whole country was outraged, and at the time, the act was warranted, temporarily. However, the encroachment of rights was unmistakable and tarnished our history as a country and a democracy. That brings the argument to its third tenet: the omnipotent rights granted to the government in the Patriot Act never should have been implemented for so long. The systemic and systematic surveillance of US citizens happened for almost a decade. We can also reflect on past oversight failures. Regarding these relatively unprecedented activities, HUAC (House Un-American Activities Committee) was one of the most comparable state-sanctioned actions. Not all, but certainly most Americans look at HUAC with disdain and contempt. Within our domestic schools, it is taught as a black mark on our nation's history. Even if used in moderation, NSLs and censorship can slowly corrupt the morals and ideals of a country, just as excessive surveillance did during the Red Scare.</p>

      <p>The core question of this whole debate entails whether a federal employee serving in the citizens' best interests should need an official judge-ordered precept for surveillance. What about if it is for national security grounds? Or an impending terrorist threat? These are questions with imperceptible answers that require careful examination and context. Even though these are nuanced matters, nobody who is a citizen of the state deserves to be spied on without an official warrant from a judge. Even when most citizens agree that surveillance is not in their personal or business interests they are helpless to the whims of the "black ops" and highly kept secrets of these shady highly-funded government agencies. Almost all damning documents are protected from FOIA with immense classification measures along with the agents not being permitted to speak on the topic in a deposition or affidavit. All that prevents legal and PR repercussions. In full summary, US citizens should unequivocally not be surveilled by the people who have put their hands on a Bible to protect them, their interests domestically, and their security. Censorship is a slippery slope, and we are slowly (and accelerating) into a much more surveillance state of society.</p>

      <h2>Works Cited</h2>

      <ul>
        <li>American Civil Liberties Union. "NSA Surveillance." <em>American Civil Liberties Union</em>, 2013, <a href="http://www.aclu.org/issues/national-security/privacy-and-surveillance/nsa-surveillance">www.aclu.org</a>.</li>
        <li>Bureau of Justice Assistance. "The Foreign Intelligence Surveillance Act of 1978 (FISA)." <em>Bureau of Justice Assistance</em>, <a href="https://bja.ojp.gov/program/it/privacy-civil-liberties/authorities/statutes/1286">bja.ojp.gov</a>.</li>
        <li>Electronic Frontier Foundation. "NSA Spying." <em>Electronic Frontier Foundation</em>, <a href="http://www.eff.org/nsa-spying">www.eff.org</a>.</li>
        <li>"Intelligence Surveillance." <em>EPIC – Electronic Privacy Information Center</em>, <a href="https://epic.org/issues/surveillance-oversight/intelligence-surveillance/">epic.org</a>.</li>
        <li>Nakashima, Ellen. "NSA Surveillance Program Still Raises Privacy Concerns Years after Exposure, Member of Privacy Watchdog Says." <em>Washington Post</em>, 29 June 2021, <a href="http://www.washingtonpost.com/national-security/nsa-surveillance-xkeyscore-privacy/2021/06/29/b2134e7a-d685-11eb-a53a-3b5450fdca7a_story.html">www.washingtonpost.com</a>.</li>
        <li>Taitz, Sarah. "Five Things to Know about NSA Mass Surveillance and the Coming Fight in Congress." <em>American Civil Liberties Union</em>, 11 Apr. 2023, <a href="http://www.aclu.org/news/national-security/five-things-to-know-about-nsa-mass-surveillance-and-the-coming-fight-in-congress">www.aclu.org</a>.</li>
      </ul>
    `
  }
};

// Writing page — filter, detail view
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('writing-grid');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const tagSelect = document.getElementById('tag-filter');
  if (!grid || !filterTabs.length) return;

  // Sort cards newest-first on load
  sortCardsNewest();

  // Count items per category and update tab labels
  updateFilterCounts();

  function applyFilters() {
    const activeTab = document.querySelector('.filter-tab.active');
    const category = (activeTab && activeTab.dataset.category) ? activeTab.dataset.category : 'all';
    const currentTagSelect = document.getElementById('tag-filter');
    const tag = currentTagSelect && currentTagSelect.value ? currentTagSelect.value : 'all';

    document.querySelectorAll('.writing-card-outline').forEach(outline => {
      const card = outline.querySelector('.writing-card');
      if (!card) return;
      const cardCategory = (card.dataset.category || '').trim();
      const cardTags = (card.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      const categoryMatch = category === 'all' || cardCategory === category;
      const tagMatch = tag === 'all' || cardTags.includes(tag);
      outline.style.display = categoryMatch && tagMatch ? '' : 'none';
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyFilters();
    });
  });

  if (tagSelect) {
    tagSelect.addEventListener('change', applyFilters);
  }

  // Bind click handlers on static cards
  bindCardClicks();


  function parseCardDate(str) {
    if (!str) return new Date(0);
    if (/^\d{4}-\d{2}$/.test(str)) str = str + '-01';
    return new Date(str);
  }

  function sortCardsNewest() {
    const outlines = Array.from(grid.querySelectorAll('.writing-card-outline'));
    outlines.sort((a, b) => {
      const cardA = a.querySelector('.writing-card');
      const cardB = b.querySelector('.writing-card');
      const da = parseCardDate(cardA && cardA.dataset.date);
      const db = parseCardDate(cardB && cardB.dataset.date);
      return db - da;
    });
    outlines.forEach(outline => grid.appendChild(outline));
  }

  function updateFilterCounts() {
    const cards = Array.from(document.querySelectorAll('.writing-card'));
    const categoryCounts = { all: cards.length };
    cards.forEach(card => {
      const cat = (card.dataset.category || '').trim();
      if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const labels = { all: 'All', essays: 'Essays', articles: 'Articles' };
    document.querySelectorAll('.filter-tab').forEach(tab => {
      const category = tab.dataset.category;
      const label = labels[category] || category;
      const count = categoryCounts[category] ?? 0;
      tab.textContent = `${label} (${count})`;
    });
  }

  function bindCardClicks() {
    grid.querySelectorAll('.writing-card').forEach(card => {
      if (card.dataset.bound) return;
      card.dataset.bound = '1';
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        // Press cards open external link
        if ((card.dataset.category || '') === 'press' && card.dataset.href) {
          window.open(card.dataset.href, '_blank', 'noopener');
          return;
        }
        // Cards with external links
        if (card.dataset.href && card.dataset.href !== '#') {
          window.open(card.dataset.href, '_blank', 'noopener');
          return;
        }
        // Full essay content
        if (card.dataset.article && articles[card.dataset.article]) {
          const a = articles[card.dataset.article];
          showArticle({ title: a.title, body: a.body, date: a.date, readTime: a.readTime, isHtml: true });
          return;
        }
        const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
        const body = card.dataset.body || (card.querySelector('.excerpt') ? card.querySelector('.excerpt').textContent : '');
        const dateSpan = card.querySelector('.meta span');
        const date = dateSpan ? dateSpan.textContent : '';
        showArticle({ title, body, date, readTime: '' });
      });
    });
  }

  let progressBar = null;
  let progressHandler = null;

  function addProgressBar() {
    removeProgressBar();
    progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);

    progressHandler = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) { progressBar.style.width = '100%'; return; }
      const pct = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
      progressBar.style.width = pct + '%';
    };

    window.addEventListener('scroll', progressHandler, { passive: true });
    progressHandler();
  }

  function removeProgressBar() {
    if (progressHandler) {
      window.removeEventListener('scroll', progressHandler);
      progressHandler = null;
    }
    if (progressBar) {
      progressBar.remove();
      progressBar = null;
    }
  }

  function performTransition(callback) {
    if (document.startViewTransition) {
      document.startViewTransition(callback);
    } else {
      callback();
    }
  }

  // Article detail view
  function showArticle(post) {
    const main = document.querySelector('.writing-page');
    const prevHTML = main.innerHTML;

    const dateStr = post.date ? new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : '';

    const bodyContent = post.isHtml ? post.body : formatBody(post.body || '');

    performTransition(() => {
      main.innerHTML = `
        <div class="article-view">
          <a href="#" class="back-link" id="back-to-grid">&larr; Back to writing</a>
          <h1>${escapeHtml(post.title)}</h1>
          <div class="article-meta">${dateStr}${post.readTime ? ' &middot; ' + escapeHtml(post.readTime) : ''}</div>
          <div class="article-body">${bodyContent}</div>
        </div>
      `;

      document.getElementById('back-to-grid').addEventListener('click', (e) => {
        e.preventDefault();
        performTransition(() => {
          removeProgressBar();
          main.innerHTML = prevHTML;
          rebindEvents();
        });
      });

      window.scrollTo({ top: 0 });
      addProgressBar();
    });
  }

  function formatBody(text) {
    return text.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('');
  }

  function rebindEvents() {
    const tabs = document.querySelectorAll('.filter-tab');
    const tagSelectEl = document.getElementById('tag-filter');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        applyFilters();
      });
    });
    if (tagSelectEl) tagSelectEl.addEventListener('change', applyFilters);
    grid.querySelectorAll('.writing-card').forEach(card => delete card.dataset.bound);
    bindCardClicks();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
