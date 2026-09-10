/* Entry 1 — Bath, in the kitchen. A one-line `note`: Felix at his parents' house in
   England, a week after the Tour du Mont-Blanc, before he has said the decision out loud.
   B1. Seeds the plus-que-parfait as a transparent stretch. Escaping: CLAUDE.md §8. */
FelixNotes.register({
  id:'bath-cuisine', no:1, date:'2026-09-20', kind:'note', level:'B1',
  title:'Bath, dans la cuisine', titleEn:'Bath, in the kitchen',
  place:'Bath, Angleterre', lat:51.3811, lng:-2.3590,
  fr:[
    "Bath, sept heures du matin. Il pleut, évidemment. Ma mère a posé le café devant moi sans rien dire, et j'ai compris qu'elle savait déjà ce que je n'avais pas encore dit à voix haute."
  ],
  en:[
    "Bath, seven in the morning. It's raining, obviously. My mother set the coffee down in front of me without a word, and I understood that she already knew what I hadn't yet said out loud."
  ],
  simple:[
    [ // ¶ 0
      {fr:"Je suis à Bath. Il est sept heures du matin.", en:"I am in Bath. It is seven in the morning."},
      {fr:"Il pleut, bien sûr.", en:"It is raining, of course."},
      {fr:"Ma mère a mis le café devant moi. Elle n'a rien dit. J'ai compris : elle savait déjà. Je n'ai pas encore parlé, mais elle savait.", en:"My mother put the coffee in front of me. She said nothing. I understood: she already knew. I have not spoken yet, but she knew."}
    ]
  ],
  vocab:[
    ['évidemment','obviously, of course'],
    ['sans rien dire','without saying anything'],
    ['à voix haute','out loud'],
    ['poser','to set down, to put down', FelixNotes.verb('poser',
      ["je pose","tu poses","il/elle pose","nous posons","vous posez","ils/elles posent"],
      ["j'ai posé","tu as posé","il/elle a posé","nous avons posé","vous avez posé","ils/elles ont posé"],
      ["je posais","tu posais","il/elle posait","nous posions","vous posiez","ils/elles posaient"],
      ["je poserai","tu poseras","il/elle posera","nous poserons","vous poserez","ils/elles poseront"])],
    ['comprendre','to understand', FelixNotes.verb('comprendre',
      ["je comprends","tu comprends","il/elle comprend","nous comprenons","vous comprenez","ils/elles comprennent"],
      ["j'ai compris","tu as compris","il/elle a compris","nous avons compris","vous avez compris","ils/elles ont compris"],
      ["je comprenais","tu comprenais","il/elle comprenait","nous comprenions","vous compreniez","ils/elles comprenaient"],
      ["je comprendrai","tu comprendras","il/elle comprendra","nous comprendrons","vous comprendrez","ils/elles comprendront"])]
  ],
  gram:[
    {h:'Three tenses in one sentence: the keystone, compressed',
     p:'<span class="ex">Il pleut</span> is the present frame. Then two <b>passé composé</b> events, one after the other: <span class="ex">ma mère a posé le café</span>, <span class="ex">j\'ai compris</span>. Inside the second one, an <b>imparfait</b> state: <span class="ex">elle savait déjà</span> <span class="arrow">→</span> she already knew (a state, not an action). Events move, states sit still — that is the whole rule.'},
    {h:'A step further back: the <em>plus-que-parfait</em>',
     p:'<span class="ex">ce que je n\'avais pas encore dit</span> <span class="arrow">→</span> what I had not yet said. Built like the passé composé but with the auxiliary in the <b>imparfait</b>: <span class="ex">j\'avais dit</span>, <span class="ex">elle était partie</span>. It places one past moment <em>before</em> another past moment. Notice where <em>pas encore</em> sits: around the auxiliary, <span class="ex">je n\'avais <b>pas encore</b> dit</span>.'}
  ]
});
