# Learning guide — English
CATS = {
    'games': 'Game guides',
    'learn': 'Math practice tips',
    'app': 'The app',
    'find': 'Find a game',
    'story': 'Behind the game',
    'help': 'Help',
}

HUB = {
    'title': 'Learning Guide',
    'desc': 'How to play all six SumSum Playground games, practical mental math tips, a guide to the app and group challenges, and the story of how a solo developer shipped it.',
    'lead': 'Get more out of SumSum Playground, sharpen your mental math, and read the news and stories behind the game. Good for reading alone, or with family and friends.',
}

PAGES = [
{
'slug': 'falling-problems', 'cat': 'games', 'mins': 4,
'title': 'Falling Problems — how to stop the rain',
'desc': 'Rules, scoring, hearts and levels in the SumSum Playground game "Falling Problems", plus tips for getting a higher score.',
'body': '''
<p class="lead">Math problems fall from the sky like rain. Type each answer before the card hits the ground. It is the most arcade-like game in SumSum Playground and the one we recommend trying first.</p>

<h2>How to play</h2>
<ol>
  <li>Pick <b>Falling Problems</b> and tap <b>Play</b>.</li>
  <li>After the 3-2-1 countdown, problem cards start to fall.</li>
  <li>Type the answer on the number pad (or your keyboard on a computer) and press <b>OK</b>.</li>
  <li>Every card with that answer pops.</li>
</ol>
<p>You don't need to choose a card. If two cards share the same answer, one correct entry clears both.</p>

<h2>Points and hearts</h2>
<div class="table-wrap"><table>
  <tr><th>Correct</th><td>10 points × current level (30 points at level 3)</td></tr>
  <tr><th>Wrong answer</th><td>Lose half a heart</td></tr>
  <tr><th>Card hits the ground</th><td>Lose one heart</td></tr>
  <tr><th>All 3 hearts gone</th><td>Game over</td></tr>
</table></div>
<p>You level up every 20 correct answers. Each answer is worth more, but cards appear more often and fall faster. Up to 8 cards can be on screen at once.</p>

<h2>Tips for a higher score</h2>
<h3>1. Always clear the lowest card first</h3>
<p>Cards near the top can wait. Solving the card closest to the ground first is the single best way to keep your hearts.</p>
<h3>2. Grab the easy ones</h3>
<p>When several cards are at the same height, clear quick ones like <b>2 × 3</b> first. An emptier screen gives you time to think about the harder ones.</p>
<h3>3. A wrong answer costs half, a miss costs a whole heart</h3>
<p>Guessing costs half a heart, while letting a card land costs a full one. If a card is about to land, a confident guess is worth it. If it is still high up, take your time and calculate.</p>
<h3>4. Hands on the pad, eyes on the screen</h3>
<p>Looking down at the keypad for every digit lets cards sneak down. On a phone, rest both thumbs over the pad; on a computer, use the number keys.</p>

<div class="tip"><p><b>Use Practice mode</b> — Practice lets you choose from five falling speeds. Start slow to build accuracy, then move up one step once you rarely lose a heart.</p></div>

<h2>What it trains</h2>
<p>Falling Problems builds the habit of <b>scanning several problems and deciding what to do first</b>. Because you type the answer yourself, you have to finish every calculation exactly. It is great for children who have just learned carrying or their times tables.</p>
'''},
{
'slug': 'time-challenge', 'cat': 'games', 'mins': 3,
'title': '1 min Challenge — solve as many as you can',
'desc': 'Rules, scoring and penalties in the SumSum Playground "1 min Challenge", plus tricks for finding the right answer among 12 choices quickly.',
'body': '''
<p class="lead">Answer as many problems as you can before time runs out. You pick from 12 choices instead of typing, so the faster you calculate, the faster your score climbs.</p>

<h2>How to play</h2>
<ol>
  <li>Choose <b>1 min Challenge</b>. In Practice you can set 30 seconds, 1 minute, 1.5 minutes or 2 minutes, and the name changes to match (for example "30 sec Challenge").</li>
  <li>A problem appears with 12 answer choices below it, sorted from smallest to largest.</li>
  <li>Tap the right one and the next problem appears instantly.</li>
</ol>

<h2>Scoring</h2>
<div class="table-wrap"><table>
  <tr><th>Correct</th><td>10 points</td></tr>
  <tr><th>Wrong choice</th><td>−5 points and that choice is disabled. The same problem stays.</td></tr>
  <tr><th>Time up</th><td>Your score so far is your record.</td></tr>
</table></div>
<p>Because wrong taps cost points, tapping randomly actually lowers your score. Problems get a little harder every 10 correct answers.</p>

<h2>Finding the answer fast</h2>
<h3>The choices are in order</h3>
<p>Choices always run from small to large. Estimate first and look only near that value. For <b>38 + 47</b>, think "a bit over 80" and check the last row first.</p>
<h3>Check the last digit</h3>
<p>When several choices are close, work out just the ones digit: 8 + 7 = 15, so the answer ends in 5. Only one or two choices will match.</p>
<h3>Even or odd for multiplication</h3>
<p>If either number is even, the product is even. 7 × 8 can't be odd, so skip every odd choice.</p>

<div class="tip"><p><b>Ranked</b> — Ranked 1 min Challenge uses the same rules for everyone (Normal, all four operations, 1 minute), so it is a fair way to compete with friends and family.</p></div>

<h2>What it trains</h2>
<p>1 min Challenge builds <b>estimation and calculation speed</b>. It suits students who know the methods but are slow, or who run out of time in tests.</p>
'''},
{
'slug': 'sixty-question-race', 'cat': 'games', 'mins': 3,
'title': '60-Question Race — how to cut your time',
'desc': 'How the SumSum Playground "60-Question Race" works, how it is timed, and how to get faster without making more mistakes.',
'body': '''
<p class="lead">Solve 60 problems as quickly as you can. In every other game a higher score is better, but here a <b>shorter time</b> is the better record.</p>

<h2>How to play</h2>
<ol>
  <li>Choose <b>60-Question Race</b> and start.</li>
  <li>Type each answer on the number pad and press OK.</li>
  <li>A banner shows your progress every 10 problems.</li>
  <li>The clock stops the moment you answer the 60th problem correctly.</li>
</ol>

<h2>What happens when I'm wrong?</h2>
<p>A wrong answer keeps the same problem on screen. There is no penalty, but the clock keeps running while you try again. In the end, <b>being accurate is the fastest way</b>. Missed problems also appear in the review list on the results screen.</p>

<h2>Tips to cut your time</h2>
<h3>Find a rhythm</h3>
<p>Sixty problems is longer than it sounds. Rushing the first ten usually causes mistakes later. Repeat "read → calculate → type → OK" at a steady pace.</p>
<h3>A problem isn't done until OK</h3>
<p>Many players type the answer and then hesitate before OK. On a phone, keep your right thumb near the OK button to save a fraction of a second on every problem. Over 60 problems that adds up.</p>
<h3>Turn division into multiplication</h3>
<p>Think of <b>56 ÷ 8</b> as "8 times what is 56?" and your times tables give you 7 right away.</p>

<div class="tip"><p><b>Set a goal</b> — Note your first time, then play once a day for a week. Cutting your time by 10% means your speed has really improved.</p></div>

<h2>What it trains</h2>
<p>Finishing a fixed set builds <b>focus and stamina</b>. It feels like a school worksheet, which makes it good practice before a test.</p>
'''},
{
'slug': 'balloon-pop', 'cat': 'games', 'mins': 3,
'title': 'Balloon Pop — never let the right balloon escape',
'desc': 'Rules, hearts, levels and balloon speed in the SumSum Playground game "Balloon Pop", with tips for quicker reactions.',
'body': '''
<p class="lead">A problem appears and four number balloons float up. Tap the balloon with the right answer to pop it. It only takes one finger, so even young children pick it up quickly.</p>

<h2>How to play</h2>
<ol>
  <li>Choose <b>Balloon Pop</b> and start.</li>
  <li>A problem such as 3 + 17 = ? appears, and four balloons rise at different speeds.</li>
  <li>Pop the right balloon to move on to the next problem.</li>
</ol>

<h2>Points and hearts</h2>
<div class="table-wrap"><table>
  <tr><th>Pop the right balloon</th><td>10 points × current level</td></tr>
  <tr><th>Tap a wrong balloon</th><td>Lose one heart</td></tr>
  <tr><th>Right balloon flies away</th><td>Lose one heart and move to the next problem</td></tr>
</table></div>
<p>You level up every 8 correct answers, and each level makes the balloons 25% faster (up to 3.5 times the starting speed). Each balloon has a slightly different speed, so the right one can escape first.</p>

<h2>Tips</h2>
<h3>Calculate first, look second</h3>
<p>Moving balloons pull your eyes. Work out the answer before you look at them; once you know the number, finding it takes under a second.</p>
<h3>Watch the fastest balloon</h3>
<p>If the right balloon is the fastest, it disappears quickly. After calculating, check the highest balloons first.</p>
<h3>A wrong tap costs the same as a miss</h3>
<p>Both cost one heart, so if you are unsure, take another moment to check.</p>

<div class="tip"><p><b>Playing with young children</b> — In Practice, choose addition only, the Easy range (up to 10) and the slowest speed. Small wins make children want to move up a level on their own.</p></div>

<h2>What it trains</h2>
<p>Balloon Pop builds <b>quick recall</b>. It is ideal for addition and subtraction basics and for checking times tables, and it works for children who aren't comfortable typing yet.</p>
'''},
{
'slug': 'beat-the-clock', 'cat': 'games', 'mins': 3,
'title': 'Beat the Clock — keep the timer alive',
'desc': 'How time is added and removed in the SumSum Playground game "Beat the Clock", and the accuracy-first strategy for lasting longer.',
'body': '''
<p class="lead">The clock keeps ticking down, but every right answer adds time. See how long you can survive.</p>

<h2>How to play</h2>
<ol>
  <li>Choose <b>Beat the Clock</b>. The clock starts at 30 seconds.</li>
  <li>Each problem has four choices. Tap the right one to get the next problem.</li>
  <li>The game ends when the clock hits zero.</li>
</ol>

<h2>Time rules</h2>
<div class="table-wrap"><table>
  <tr><th>Correct</th><td>10 points and +2 seconds (shrinking as you level up, to a minimum of +1 second)</td></tr>
  <tr><th>Wrong</th><td>−3 seconds</td></tr>
  <tr><th>Clock limit</th><td>The clock can't go above 30 seconds</td></tr>
</table></div>
<p>You level up every 10 correct answers, and each level reduces the time bonus by 0.1 seconds. It is relaxed at first and gets tighter the longer you last.</p>

<h2>Strategy</h2>
<h3>One mistake = 1.5 right answers</h3>
<p>A mistake costs 3 seconds while a right answer earns 2. You need more than one and a half right answers to make up for one mistake, and three once the bonus drops to 1 second. In this game <b>accuracy beats speed</b>.</p>
<h3>Slow down when the clock is full</h3>
<p>Near 30 seconds, extra time is wasted, so focus on being correct. Below 10 seconds, clear easy problems quickly to build time back up.</p>
<h3>Enjoy the combos</h3>
<p>Three or more right answers in a row show a combo. Keeping the combo going naturally keeps you alive longer.</p>

<h2>What it trains</h2>
<p>Beat the Clock builds <b>the habit of not making careless mistakes</b>. It shows children who rush that being accurate is what lets you last.</p>
'''},
{
'slug': 'true-or-false', 'cat': 'games', 'mins': 3,
'title': 'True or False — spot wrong equations at a glance',
'desc': 'Rules and penalties in the SumSum Playground game "True or False", plus quick checking tricks to spot wrong equations without doing the whole calculation.',
'body': '''
<p class="lead">You see a complete equation such as "8 × 9 = 81". Tap O if it is right and X if it is wrong. On top of calculation, it trains your <b>eye for checking answers</b>.</p>

<h2>How to play</h2>
<ol>
  <li>Choose <b>True or False</b>. In Practice you can set the time from 30 seconds to 2 minutes.</li>
  <li>Tap <b>O</b> if the equation is right, <b>X</b> if it is wrong.</li>
  <li>Keep going until time runs out.</li>
</ol>

<h2>Scoring</h2>
<div class="table-wrap"><table>
  <tr><th>Right call</th><td>10 points</td></tr>
  <tr><th>Wrong call</th><td>−10 points and −3 seconds</td></tr>
</table></div>
<p>Wrong calls cost both points and time, so guessing won't raise your score.</p>

<h2>Checking tricks</h2>
<h3>1. Look at the last digit</h3>
<div class="calc">47 + 38 = 86 ?
Ones digits: 7 + 8 = 15 → the answer ends in 5
86 ends in 6, so X</div>
<h3>2. Even or odd</h3>
<p>Even × anything is even, so <b>6 × 7 = 43</b> is X without calculating. Odd + odd is even, and even + odd is odd.</p>
<h3>3. Check the size</h3>
<p><b>9 × 9 = 18</b> is far too small and <b>12 + 13 = 52</b> is far too big. A rough estimate catches many wrong equations.</p>
<h3>4. Check division by multiplying</h3>
<p>For <b>42 ÷ 6 = 8</b>, think 6 × 8 = 48. That isn't 42, so X.</p>

<div class="tip"><p><b>Use it in tests</b> — The last-digit, even/odd and estimate checks work just as well for checking your answers in a school test.</p></div>

<h2>What it trains</h2>
<p>True or False builds <b>number sense and checking habits</b>. It is great for students who calculate well but make frequent slips.</p>
'''},
{
'slug': 'mental-math-tips', 'cat': 'learn', 'mins': 5,
'title': '7 tricks for faster mental math',
'desc': 'Making tens, adding from the left, rounding and adjusting and more: seven mental math tricks with worked examples for children and adults.',
'body': '''
<p class="lead">People who are fast at mental math aren't geniuses; they know a few ways to make calculations easier. Here are seven you can use today.</p>

<h2>1. Make tens first</h2>
<p>When adding several numbers, pair up the ones that make 10.</p>
<div class="calc">7 + 6 + 3 + 4
= (7 + 3) + (6 + 4)
= 10 + 10 = 20</div>

<h2>2. Add from the left</h2>
<p>On paper we start with the ones, but in your head it is easier to start with the tens.</p>
<div class="calc">46 + 37
Tens: 40 + 30 = 70
Ones: 6 + 7 = 13
Together: 70 + 13 = 83</div>

<h2>3. Round, then adjust</h2>
<p>Numbers close to a round number, like 9, 19 or 99, are easier if you round first and fix it afterwards.</p>
<div class="calc">58 + 29 → 58 + 30 − 1 = 87
73 − 19 → 73 − 20 + 1 = 54</div>

<h2>4. Subtract by adding up</h2>
<p>Subtraction with borrowing is easier as "how much do I add?"</p>
<div class="calc">62 − 47 = ?
47 to 50 is 3, 50 to 62 is 12
3 + 12 = 15</div>

<h2>5. Split multiplication</h2>
<p>Break a two-digit number into tens and ones.</p>
<div class="calc">14 × 6 = 10 × 6 + 4 × 6 = 60 + 24 = 84</div>

<h2>6. Times 5 is half of times 10</h2>
<div class="calc">18 × 5 = 18 × 10 ÷ 2 = 180 ÷ 2 = 90</div>

<h2>7. Turn division into multiplication</h2>
<p><b>63 ÷ 7</b> is "7 times what is 63?" Solid times tables make division fast too.</p>

<h2>Make the tricks stick</h2>
<p>Reading isn't enough. Pick one trick a day and use it on purpose while playing, for example "round and adjust" during a <a href="/en/guide/time-challenge/">1 min Challenge</a>. In a week all seven will feel natural.</p>

<div class="tip"><p><b>Accuracy first</b> — A trick is useless if it leads to wrong answers. Go slowly at first and only speed up once you are above 90% correct.</p></div>
'''},
{
'slug': 'carrying-and-borrowing', 'cat': 'learn', 'mins': 5,
'title': 'Carrying and borrowing without the confusion',
'desc': 'Why children struggle with carrying in addition and borrowing in subtraction, and a step-by-step way to learn it, starting from number bonds to 10.',
'body': '''
<p class="lead">Carrying and borrowing are where many first and second graders get stuck. Memorising steps without understanding them leads to more mistakes as numbers get bigger. Here is a step-by-step path.</p>

<h2>Why is it hard?</h2>
<p>Carrying means "when the ones add up to 10 or more, move 1 to the tens". Children often don't feel why, or that the carried 1 is really ten. That leads to forgetting the carried 1, or treating a borrowed ten as one.</p>

<h2>Step 1: Number bonds to 10</h2>
<p>Everything rests on pairs that make 10: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5. Practise with fingers or counters until "7 and what make 10?" takes under a second.</p>

<h2>Step 2: Crossing 10 with single digits</h2>
<p>Solve sums like 8 + 5 by making 10 and adding the rest.</p>
<div class="calc">8 + 5
Split 5 into 2 and 3
8 + 2 = 10, 10 + 3 = 13</div>

<h2>Step 3: Two-digit carrying</h2>
<p>Use the same idea with bigger numbers, and ask your child to say out loud that the ten from the ones becomes 1 in the tens.</p>
<div class="calc">36 + 28
Ones: 6 + 8 = 14 → write 4, the ten moves to the tens
Tens: 30 + 20 + 10 = 60
Answer: 64</div>

<h2>Step 4: Borrowing</h2>
<p>Borrowing takes a ten from the tens place. Stress that "the borrowed 1 is really 10".</p>
<div class="calc">52 − 27
You can't take 7 from 2, so borrow a ten
12 − 7 = 5, tens: 40 − 20 = 20
Answer: 25</div>
<p>Another way is to add up: from 27, add 3 to reach 30, then 22 to reach 52, so 25. Pick the method that suits your child.</p>

<h2>Practise with the games</h2>
<ul>
  <li>In SumSum Playground Practice, turn on <b>addition</b> (or subtraction) only and choose <b>Normal</b> (up to 20). Problems that cross 10 come up naturally.</li>
  <li><a href="/en/guide/balloon-pop/">Balloon Pop</a> uses choices, so it feels easier. Move on to typing answers in <a href="/en/guide/falling-problems/">Falling Problems</a> once your child is comfortable.</li>
  <li>Missed problems come back more often in the next game. Look at the review list together and ask your child to explain where it went wrong.</li>
</ul>

<div class="tip"><p><b>For parents</b> — Instead of giving the answer straight away, ask about the process: "How many are left in the ones?" It works much better.</p></div>
'''},
{
'slug': 'times-tables', 'cat': 'learn', 'mins': 5,
'title': 'Learn times tables by understanding, not just memorising',
'desc': 'The ideas behind multiplication, the easiest order to learn the tables, how swapping factors halves the work, and how to practise with games.',
'body': '''
<p class="lead">It looks like 81 facts to memorise, but once you understand a few ideas there are far fewer new ones to learn. Here is an order that is easier and sticks longer.</p>

<h2>Multiplication is repeated addition</h2>
<p>3 × 4 means adding 3 four times (3 + 3 + 3 + 3). Understanding this lets children rebuild a fact they have forgotten. Laying out four groups of three counters helps.</p>

<h2>Swapping halves the work</h2>
<p>3 × 7 and 7 × 3 have the same answer. That alone almost halves what you need to learn. Once you know the 3 times table, you already know 7 × 3.</p>

<h2>Learn in order of difficulty</h2>
<ol>
  <li><b>1s and 10s</b>: the number itself, or add a zero.</li>
  <li><b>2s</b>: doubles.</li>
  <li><b>5s</b>: answers end in 0 or 5, which also links to reading a clock.</li>
  <li><b>9s</b>: the tens go up by one while the ones go down by one (09, 18, 27, 36…), and the digits always add up to 9.</li>
  <li><b>4s</b>: double the 2s.</li>
  <li><b>3s and 6s</b>: the 6s are double the 3s.</li>
  <li><b>7s and 8s</b>: swapping fills almost all of them in; the new ones are mainly 7 × 7, 7 × 8 and 8 × 8.</li>
</ol>

<h2>The tricky ones</h2>
<p>6 × 7 = 42, 7 × 8 = 56, 6 × 8 = 48 and 8 × 9 = 72 trip up many children. "5, 6, 7, 8 → 56 = 7 × 8" is one handy memory hook.</p>

<h2>Practise with the games</h2>
<ul>
  <li>In Practice, turn on <b>multiplication</b> only and start with <b>Easy</b> (up to the 5s). Move on to <b>Normal</b> (up to 9s) and <b>Hard</b> (up to 12s).</li>
  <li><a href="/en/guide/balloon-pop/">Balloon Pop</a> and <a href="/en/guide/true-or-false/">True or False</a> show you the answer to judge, which is great for checking what you've learned.</li>
  <li>Missed facts come back more often. When one reappears, slow down and get it right.</li>
</ul>

<div class="tip"><p><b>Five minutes a day is enough</b> — Recalling facts for five minutes every day sticks far better than memorising for 30 minutes once. This is called retrieval practice.</p></div>
'''},
{
'slug': 'division-help', 'cat': 'learn', 'mins': 4,
'title': 'Helping a child who finds division hard',
'desc': 'Build the meaning of division with sharing and grouping, then connect it to multiplication for fast, confident answers.',
'body': '''
<p class="lead">Division is the last operation children learn and often the hardest. Usually the real problem is a weak link to <b>multiplication</b>.</p>

<h2>Two meanings of division</h2>
<ul>
  <li><b>Sharing</b>: 12 sweets shared equally by 3 children: how many each? → 12 ÷ 3 = 4</li>
  <li><b>Grouping</b>: 12 sweets put into bags of 3: how many bags? → 12 ÷ 3 = 4</li>
</ul>
<p>Acting out both with real objects shows that division isn't just a symbol to memorise.</p>

<h2>Connect it to multiplication</h2>
<p>The surest way to get faster is to turn division into a multiplication question.</p>
<div class="calc">35 ÷ 5 = ?
→ 5 × ? = 35
→ 5 × 7 = 35
→ the answer is 7</div>
<p>Say this switch out loud a few times and it soon happens automatically. If the <a href="/en/guide/times-tables/">times tables</a> are shaky, division will be too, so check those first.</p>

<h2>Fact families</h2>
<p>3, 4 and 12 are a family: 3 × 4 = 12, 4 × 3 = 12, 12 ÷ 3 = 4, 12 ÷ 4 = 3. Make fact-family cards and say all four facts at once.</p>

<h2>Practise with the games</h2>
<ul>
  <li>Division in SumSum Playground <b>always divides evenly</b>, so children can build the basics without worrying about remainders.</li>
  <li>Turn on just <b>multiplication and division</b> in Practice so the same families come up in both directions.</li>
  <li>In <a href="/en/guide/true-or-false/">True or False</a>, check equations like "42 ÷ 6 = 8" by multiplying, which builds a checking habit too.</li>
</ul>

<div class="tip"><p><b>Be patient</b> — Division needs an extra step of thinking backwards, so being slow at first is normal. Speed follows accuracy.</p></div>
'''},
{
'slug': 'practice-by-grade', 'cat': 'learn', 'mins': 5,
'title': 'What to practise at each level, and how to set up SumSum Playground',
'desc': 'A level-by-level guide from preschool to adults: what to practise first and which SumSum Playground Practice settings to use.',
'body': '''
<p class="lead">Arithmetic is built step by step, and a shaky lower step causes slips higher up. Here is what to practise at each level and how to set up Practice mode.</p>
<p class="meta">Grades are approximate. Every child moves at their own pace, so start where problems feel comfortable.</p>

<h2>Practice by level</h2>
<div class="table-wrap"><table>
  <tr><th>Level</th><td><b>What to practise</b></td><td><b>SumSum Playground settings</b></td></tr>
  <tr><th>Preschool–Grade 1</th><td>Adding and subtracting within 10, number bonds to 10</td><td>Addition (+ subtraction) · Easy · Very slow · Balloon Pop</td></tr>
  <tr><th>Grades 1–2</th><td>Carrying and borrowing within 20</td><td>Addition and subtraction · Normal · Slow · Falling Problems</td></tr>
  <tr><th>Grade 2</th><td>Meaning of multiplication, 2s and 5s</td><td>Multiplication · Easy · Balloon Pop, True or False</td></tr>
  <tr><th>Grade 3</th><td>All times tables, meaning of division</td><td>Multiplication and division · Normal · 1 min Challenge</td></tr>
  <tr><th>Grade 4+</th><td>Mixed operations, fast and accurate</td><td>All four · Normal–Hard · 60-Question Race, Ranked</td></tr>
  <tr><th>Adults</th><td>Brain training, keeping sharp</td><td>All four · Hard · Beat the Clock</td></tr>
</table></div>

<h2>Number ranges</h2>
<ul>
  <li><b>Easy</b>: addition and subtraction up to 10, multiplication and division up to the 5s</li>
  <li><b>Normal</b>: up to 20, and up to the 9s</li>
  <li><b>Hard</b>: up to 50, and up to the 12s</li>
</ul>
<p>You can also set the range yourself with the sliders. An addition range of 15, for example, is perfect for a child who has just learned carrying.</p>

<h2>Signs it is time to move up</h2>
<ul>
  <li><b>Accuracy of 90% or more</b> on the results screen three games in a row.</li>
  <li>The review list is almost empty.</li>
  <li>Your child says "this is too easy".</li>
</ul>
<p>If you see two of these, raise the range or speed one step. If accuracy drops below 70%, it is fine to go back a step; that is strengthening the basics, not failing.</p>

<div class="tip"><p><b>Read next</b> — <a href="/en/guide/carrying-and-borrowing/">Carrying and borrowing</a>, <a href="/en/guide/times-tables/">Times tables</a>, <a href="/en/guide/division-help/">Helping with division</a></p></div>
'''},
{
'slug': 'five-minute-habit', 'cat': 'learn', 'mins': 4,
'title': 'Building a five-minute daily math habit',
'desc': 'Frequent beats long when it comes to arithmetic. How to turn five minutes of daily practice into a habit: fixed times, visible progress and the right kind of praise.',
'body': '''
<p class="lead">Arithmetic is like exercise: five minutes every day beats two hours once a week. Here is how to turn short practice into a lasting habit.</p>

<h2>Why short and often?</h2>
<p>Recalling something just as you're about to forget it makes the memory stronger. This is <b>spaced repetition</b>. A five-minute game each day naturally brings back yesterday's facts. And short sessions end before boredom sets in, so children want to come back tomorrow.</p>

<h2>Four ways to build the habit</h2>
<h3>1. Fix the time</h3>
<p>"When there's time" usually means never. Attach practice to something that already happens every day, like right after dinner.</p>
<h3>2. A clear finish line</h3>
<p>A 1 min Challenge lasts a minute and a 60-Question Race takes two to four. Goals like "three 1 min Challenges today" have a clear end.</p>
<h3>3. Watch the records grow</h3>
<p>SumSum Playground saves your best record for each game. Seeing it beat last week's is a big motivator. Stickers on a calendar help too.</p>
<h3>4. Praise effort, not scores</h3>
<p>Instead of "100 points, amazing!", try "fewer mistakes than yesterday" or "you didn't skip a day". Scores go up and down, but consistency grows when it is noticed.</p>

<h2>A sample week</h2>
<div class="table-wrap"><table>
  <tr><th>Mon · Wed · Fri</th><td>Three 1 min Challenges (speed)</td></tr>
  <tr><th>Tue · Thu</th><td>One Falling Problems game and look at the review list together (accuracy)</td></tr>
  <tr><th>Weekend</th><td>One Ranked game to check the week's progress</td></tr>
</table></div>

<div class="tip"><p><b>Stop while it's fun</b> — If a fun game turns into an hour, it can feel like a chore the next day. Stopping while you still want more is the secret.</p></div>
'''},
{
'slug': 'speed-and-accuracy', 'cat': 'learn', 'mins': 4,
'title': 'Speed or accuracy? Cutting down careless mistakes',
'desc': 'Sort mistakes into types, balance speed and accuracy in the right order, and build simple checking habits that prevent careless errors.',
'body': '''
<p class="lead">"I knew it, but I got it wrong." Mistakes aren't bad luck; they are habits, and once you know the cause you can reduce them.</p>

<h2>Three kinds of mistakes</h2>
<ul>
  <li><b>Not knowing</b>: a shaky times table or not yet understanding carrying. Go back to the concept.</li>
  <li><b>Rushing</b>: knowing how, but misreading a number or forgetting to carry.</li>
  <li><b>Copying</b>: the answer in your head was right but you typed the digits in the wrong order (54 as 45).</li>
</ul>
<p>The review list on the SumSum Playground results screen shows the right answer next to yours. Sort each mistake into a type together with your child.</p>

<h2>Accuracy first, speed later</h2>
<p>Speeding up first locks in wrong habits. Try this order:</p>
<ol>
  <li><b>Slow and correct</b>: reach 90% accuracy at a slow speed.</li>
  <li><b>Steady</b>: check that the accuracy holds for a few days.</li>
  <li><b>A little faster</b>: raise the speed or range by one step. If accuracy drops, step back.</li>
</ol>

<h2>Small habits that prevent mistakes</h2>
<h3>Estimate for one second</h3>
<p>Thinking "about 50" first catches answers that are way off, like 5 or 500.</p>
<h3>Check the last digit</h3>
<p>Recalculate just the ones digits and compare with your answer's last digit. See the <a href="/en/guide/true-or-false/">True or False guide</a> for more.</p>
<h3>Look before you press OK</h3>
<p>Glancing at your typed answer before OK removes most copying mistakes.</p>

<div class="tip"><p><b>Choosing a game</b> — For children who rush, <a href="/en/guide/beat-the-clock/">Beat the Clock</a> is great practice: mistakes cost a lot, so accuracy is what keeps you going.</p></div>
'''},
{
'slug': 'for-parents-and-teachers', 'cat': 'help', 'mins': 4,
'title': 'A guide for parents and teachers',
'desc': 'How to use SumSum Playground for arithmetic practice at home or in class, with classroom ideas and notes on using it safely with children.',
'body': '''
<p class="lead">SumSum Playground is a free arithmetic game you can use straight away without signing up. It works well as a short daily practice at home or a five-minute warm-up at the start of a lesson.</p>

<h2>At home</h2>
<ul>
  <li><b>Short and daily</b>: about five minutes a day is plenty. See <a href="/en/guide/five-minute-habit/">building a five-minute habit</a>.</li>
  <li><b>Match the level</b>: set the operations, number range and speed in Practice. The <a href="/en/guide/practice-by-grade/">level guide</a> helps.</li>
  <li><b>Review mistakes together</b>: after a game, look at the review list and ask "where did it get confusing?"</li>
  <li><b>Track records</b>: best records are saved on the device, so you can compare with a week ago.</li>
</ul>

<h2>In the classroom</h2>
<ul>
  <li><b>Warm-up</b>: put Balloon Pop or True or False on the board or TV and play together. For True or False the whole class can answer with O/X hand signs.</li>
  <li><b>Team challenge</b>: each team member plays one 1 min Challenge and the team adds up the scores.</li>
  <li><b>Ranked</b>: Ranked uses the same rules for everyone, so students can compare fairly.</li>
  <li><b>Individual practice</b>: on tablets, set Practice to each student's level. No install or account is needed.</li>
</ul>

<h2>Using it safely</h2>
<ul>
  <li>There is no sign-up or login, and we never ask for names or contact details.</li>
  <li>Only a nickname is entered for the Hall of Fame. Remind children to use <b>a nickname, not their real name or school</b>. Nicknames are limited to 8 characters and profanity is filtered.</li>
  <li>If you see an inappropriate nickname, email <a href="mailto:jhl.studio.00@gmail.com">jhl.studio.00@gmail.com</a> and we will remove it.</li>
  <li>The website may show ads. When young children play, please keep an eye out so they don't tap ads by mistake.</li>
  <li>See our <a href="/privacy.html">privacy policy</a> for details.</li>
</ul>

<div class="tip"><p><b>Tell us what you need</b> — If a feature would help your lessons (for example, practising a single times table), send us an email and we will consider it for a future update.</p></div>
'''},
{
'slug': 'faq', 'cat': 'help', 'mins': 3,
'title': 'Frequently asked questions',
'desc': 'Answers to common questions about SumSum Playground: cost, devices, saved records, the Hall of Fame, language, the app and sound.',
'body': '''
<h2>Is it free? Do I need an account?</h2>
<p>It is free and there is no sign-up. Open the site and start playing.</p>

<h2>Which devices does it work on?</h2>
<p>Any phone, tablet or computer browser. On a computer you can type answers with the number keys. The iPhone and iPad app is on the <a href="https://apps.apple.com/app/id6826497198">App Store</a>, and the Android app is on the way. See <a href="/en/guide/app-vs-web/">what the app adds</a>.</p>

<h2>Where are my records saved?</h2>
<p>Best records, badges and missed problems are saved in your browser on this device, so each device has its own records. Clearing your browser's site data also clears them.</p>

<h2>What is the difference between Practice and Ranked?</h2>
<p><b>Practice</b> lets you change the operations, number range, speed and time. <b>Ranked</b> uses the same rules for everyone (Normal, all four operations, normal speed, 1 minute), so you can compete fairly and put top scores in the Hall of Fame.</p>

<h2>How do I get into the Hall of Fame?</h2>
<p>Get a top score in Ranked and a nickname box appears on the results screen. Nicknames can use letters and numbers, up to 8 characters. Please use a nickname rather than your real name.</p>

<h2>How do I remove my score from the Hall of Fame?</h2>
<p>Email <a href="mailto:jhl.studio.00@gmail.com">jhl.studio.00@gmail.com</a> with the game and your nickname and we will remove it.</p>

<h2>The same problems seem to come back.</h2>
<p>That's on purpose. SumSum Playground remembers problems you missed and shows them more often until you get them right. It helps you practise your weak spots.</p>

<h2>Are there division problems with remainders?</h2>
<p>No. Division problems always divide evenly.</p>

<h2>Can I switch to Korean?</h2>
<p>Yes. Use the language buttons to switch between English and 한국어. The Korean guide is at <a href="/guide/">/guide/</a>.</p>

<h2>How do I turn the sound off?</h2>
<p>Use the sound and music buttons at the top of the screen to turn effects and background music off separately.</p>

<h2>I found a bug or have an idea.</h2>
<p>Send it to <a href="mailto:jhl.studio.00@gmail.com">jhl.studio.00@gmail.com</a>. Telling us the device and game helps us fix it faster.</p>
'''},
]

PAGES += [
{
'slug': 'app-vs-web', 'cat': 'app', 'mins': 4,
'title': 'SumSum Playground is now an app — 7 things the app adds',
'desc': 'SumSum Playground is out on iPhone and iPad. Here is what the app adds over the website: creating group challenge rooms, badges and records, bonus hearts, continues and more.',
'body': '''
<p class="lead">SumSum Playground is now an app. It came out on the App Store in November 2026 and is free on iPhone and iPad. The six games are the same as on the website, and the app adds several features on top.</p>

<div class="tip"><p><b>Get the app</b> — <a href="https://apps.apple.com/app/id6826497198">Download SumSum Playground on the App Store</a> (iPhone and iPad, free). The Android version will follow once testing is finished.</p></div>

<h2>Side by side</h2>
<div class="table-wrap"><table class="cmp">
  <tr><th>Feature</th><th>Web</th><th>App</th></tr>
  <tr><th>6 games · Practice · Ranked</th><td>Yes</td><td>Yes</td></tr>
  <tr><th>Hall of Fame</th><td>Top 10</td><td>Top 10 + your own rank, best score updates in place</td></tr>
  <tr><th>Group challenge</th><td>Join a room you were invited to</td><td>Create, rename and keep a list of rooms</td></tr>
  <tr><th>24 badges · Records</th><td>No</td><td>Yes</td></tr>
  <tr><th>Bonus hearts · Continue</th><td>No</td><td>Yes</td></tr>
  <tr><th>Change nickname</th><td>No</td><td>Yes</td></tr>
  <tr><th>Launch from the home screen</th><td>Open a browser</td><td>One tap</td></tr>
</table></div>

<h2>1. Create group challenge rooms</h2>
<p>A private leaderboard for your family, friends or coworkers. Create a room, send the link, and only the people with that link compete across all six games. Problems change every 24 hours and the ranking restarts every 3 days. Rooms are created in the app; invited players can also join on the web. See the <a href="/en/guide/group-match/">group challenge guide</a>.</p>

<h2>2. 24 badges and a records page</h2>
<p>The app keeps track of how many games you have played, how many problems you have solved and how many days in a row you have shown up. Hit a goal and a badge unlocks. Collect all 24 to unlock the golden block theme. The full list is in <a href="/en/guide/badges-and-hearts/">Badges and bonus hearts</a>.</p>

<h2>3. Bonus hearts</h2>
<p>With 8 badges you start each game with an extra half heart; with 16, a full extra heart. A 7-day streak adds another half. In timed games each half heart becomes 3 seconds. It is a small reward for showing up regularly.</p>

<h2>4. One more chance</h2>
<p>When a game ends you can watch a short ad and continue from where you stopped, which matters most when you were just short of your best. When you tap Play again you can also choose to start with one more heart. Skip it if you prefer, and if you buy "Remove ads" once, you get the bonus with no ads at all.</p>

<h2>5. See your own rank</h2>
<p>The website shows the top 10. The app also shows where you stand even when you are outside it. Each player has a single row, so a better score simply replaces your old one.</p>

<h2>6. Change your nickname</h2>
<p>Change it in Settings and it updates in the Hall of Fame and in every group room you are in.</p>

<h2>7. Full screen, one tap away</h2>
<p>No address bar, so problems and the number pad are larger. Tap the icon and you are playing, which makes a one-minute game at the bus stop easy.</p>

<h2>When the website is better</h2>
<ul>
  <li>You want to type fast on a computer keyboard</li>
  <li>You just want one quick game without installing anything</li>
  <li>You are showing it on a classroom TV or whiteboard</li>
</ul>
<p>Web and app records are stored separately. If you plan to keep playing, start in the app.</p>
'''},
{
'slug': 'group-match', 'cat': 'app', 'mins': 4,
'title': 'Group challenge — a private leaderboard for friends and family',
'desc': 'How SumSum Playground group challenges work: create a room, invite people with a link, play the same problems for 24 hours, and start a fresh ranking every 3 days.',
'body': '''
<p class="lead">The Hall of Fame is open to the whole world, so getting on it is hard. A group challenge is a small leaderboard for only the people you invite. Drop one link in your group chat and it starts.</p>

<h2>The rules at a glance</h2>
<div class="table-wrap"><table>
  <tr><th>Games</th><td>One room covers all six games</td></tr>
  <tr><th>Problems</th><td>They change every 24 hours from when the room was made; until then everyone gets the same ones</td></tr>
  <tr><th>Ranking</th><td>Restarts every 3 days (72 hours). The room itself stays</td></tr>
  <tr><th>Scores</th><td>Play as often as you like; only your best counts</td></tr>
  <tr><th>Nicknames</th><td>Each nickname can be used by one person per room</td></tr>
</table></div>

<h2>Creating a room (app)</h2>
<ol>
  <li>In the app, open the <b>Ranking</b> tab and tap <b>Group challenge → Create</b>.</li>
  <li>Type a room name and your nickname, for example "Family Math Champs".</li>
  <li>Tap <b>Create room</b>, then use <b>Invite friends</b> to send the link.</li>
</ol>
<p>You can also create a room from the result screen after a Ranked game. In that case the score you just made becomes the first record in the room.</p>

<h2>When you are invited</h2>
<p>Tap the link to open the room. You can join in the app if you have it, or on the web if you do not. Pick a game at the top, tap <b>Play</b>, and you get that room's problems. When you finish, enter a nickname to save your record. Rooms you have joined are listed in the app, most recent first.</p>

<h2>Why do the problems change every day?</h2>
<p>Everyone needs the same problems for it to be fair, but if they never changed, people could memorize them. So problems stay the same for a day and are replaced the next. A game started just before the change and finished after it is not recorded.</p>

<h2>Why does the ranking restart every 3 days?</h2>
<p>One huge score on day one can make everyone else give up. A fresh start every 3 days gives late joiners, and whoever came last, another shot at first place.</p>

<h2>Ideas</h2>
<ul>
  <li><b>Family room</b>: one game each after dinner. Parents do lose to their kids on times tables.</li>
  <li><b>Friends or coworkers</b>: loser buys the coffee.</li>
  <li><b>Class or club</b>: treat every 3 days as a round and name a winner each time.</li>
</ul>

<h2>What the room owner can do</h2>
<p>The person who created the room can rename it or delete it. Deleting a room removes its rankings and cannot be undone.</p>

<div class="tip"><p><b>There are badges too</b> — saving a record in a group challenge unlocks "Let's play", and finishing first unlocks "Room champion". Group challenges need the latest version of the app; if you do not see the menu, update the app from the store.</p></div>
'''},
{
'slug': 'badges-and-hearts', 'cat': 'app', 'mins': 4,
'title': 'All 24 badges and how bonus hearts work',
'desc': 'The full list of 24 badges in the SumSum Playground app and how to unlock them, the bonus hearts and golden block theme you earn, and the fastest order to collect them.',
'body': '''
<p class="lead">The SumSum Playground app has 24 badges. Some unlock after a single game and one takes a full month of daily visits. The more you collect, the bigger the head start you get.</p>

<h2>What badges give you</h2>
<div class="table-wrap"><table>
  <tr><th>8 badges</th><td>Start with an extra half heart</td></tr>
  <tr><th>16 badges</th><td>Start with an extra full heart</td></tr>
  <tr><th>24 badges</th><td>Golden block theme</td></tr>
  <tr><th>On a 7-day streak</th><td>Another half heart</td></tr>
</table></div>
<p>Games with hearts (Falling Problems, Balloon Pop) give you hearts. Timed games (Time Challenge, Beat the Clock, True or False) give you 3 seconds per half heart. The 60-Question Race has no bonus.</p>

<h2>The list</h2>
<h3>Games played</h3>
<div class="table-wrap"><table>
  <tr><th>First game</th><td>Play any game once</td></tr>
  <tr><th>Explorer</th><td>Try all 6 games</td></tr>
  <tr><th>Regular</th><td>10 games</td></tr>
  <tr><th>Arcade boss</th><td>50 games</td></tr>
  <tr><th>VIP</th><td>100 games</td></tr>
  <tr><th>Arcade legend</th><td>300 games</td></tr>
</table></div>
<h3>Problems solved</h3>
<div class="table-wrap"><table>
  <tr><th>100 solved</th><td>100 correct answers</td></tr>
  <tr><th>1000 solved</th><td>1,000 correct answers</td></tr>
  <tr><th>5000 solved</th><td>5,000 correct answers</td></tr>
  <tr><th>Math master</th><td>20,000 correct answers</td></tr>
</table></div>
<h3>Streaks and flawless games</h3>
<div class="table-wrap"><table>
  <tr><th>Streak 20 · 50 · 100</th><td>That many right in a row in one game</td></tr>
  <tr><th>Flawless</th><td>20 or more right with no mistakes</td></tr>
  <tr><th>Perfectionist</th><td>10 flawless games</td></tr>
</table></div>
<h3>Ranked</h3>
<div class="table-wrap"><table>
  <tr><th>Challenger</th><td>Finish a Ranked game</td></tr>
  <tr><th>Ranked regular</th><td>Finish 10 Ranked games</td></tr>
  <tr><th>Ranked master</th><td>Finish 50 Ranked games</td></tr>
</table></div>
<h3>Daily streaks</h3>
<div class="table-wrap"><table>
  <tr><th>3-day · 7-day streak</th><td>Visit that many days in a row</td></tr>
  <tr><th>2-week streak</th><td>14 days in a row</td></tr>
  <tr><th>30-day streak</th><td>30 days in a row</td></tr>
</table></div>
<h3>Group challenge</h3>
<div class="table-wrap"><table>
  <tr><th>Let's play</th><td>Save a record in a group challenge</td></tr>
  <tr><th>Room champion</th><td>Be #1 in a group challenge</td></tr>
</table></div>

<h2>The fastest way to your first 8</h2>
<ol>
  <li>Play each of the six games once. That unlocks <b>First game</b> and <b>Explorer</b>.</li>
  <li>Make one of those a Ranked game for <b>Challenger</b>.</li>
  <li>Four more games gets you to 10 for <b>Regular</b>, and you will likely pass 100 correct answers for <b>100 solved</b> on the way.</li>
  <li>In Practice, set Easy and addition only and play the 60-Question Race. It is the best place to go for <b>Streak 20</b> and <b>Flawless</b>. With no mistakes you also reach Streak 50.</li>
  <li>Come back three days running for <b>3-day streak</b>. That puts you past 8.</li>
</ol>

<h2>The hardest ones</h2>
<p><b>Streak 100</b> needs 100 correct answers in a row in a single game. You have to hold your accuracy all the way, so slow down and check each answer. <a href="/en/guide/speed-and-accuracy/">Speed vs accuracy</a> helps here. <b>30-day streak</b> is about habit, not skill: set a reminder and play one game a day.</p>

<div class="tip"><p><b>Stored on your device</b> — badges and records live on the device where the app is installed. Deleting the app deletes them too.</p></div>
'''},
{
'slug': 'app-launch-story', 'cat': 'story', 'mins': 7,
'title': 'How I shipped a math game app on my own',
'desc': 'A solo developer on building the arithmetic web game SumSum Playground and releasing it on the App Store: the idea, the redesign, getting ready for review, and why Android came later.',
'body': '''
<p class="lead">SumSum Playground is made by one person, under the name JHL STUDIO. It started as a website in the fall of 2026 and reached the App Store as an iPhone and iPad app that November. This is what happened along the way, written down in order, in case it helps someone preparing their own first release.</p>

<h2>It began with a one-minute times table test</h2>
<p>The first idea was simple: a website where you practice addition, subtraction, multiplication and division as games. One where problems fall and you answer before they land. One where you answer as many as you can before time runs out. One that times how long you take to get 60 right. Those became Falling Problems, Time Challenge and the 60-Question Race. Balloon Pop, Beat the Clock and True or False came later, making six.</p>
<p>The code was written by talking with an AI, the approach people call vibe coding. My job was to keep saying how things should feel. Two buttons have different widths. That line breaks in an awkward place. The game resumes instantly after a pause and I miss the timing. Fixing small annoyances like those, one at a time, was most of the work.</p>

<h2>Design before revenue</h2>
<p>The first version looked clean and was easy to forget. I decided to redo the design before thinking about ads, and chose a retro arcade direction: a logo made of stacked blocks, pixel type, neon colors on a dark background. Arithmetic practice makes people think of worksheets. I wanted it to feel like standing in front of an arcade cabinet.</p>
<p>I also set one rule then: <b>a game for everyone</b>. Kids play it, but it should not feel odd for an office worker on the subway or a grandparent keeping their mind active. So there are no mascots and no gold-star stickers.</p>

<h2>What the Hall of Fame changed</h2>
<p>A math game played alone gets old quickly. "One more game" only appeared after I added the Hall of Fame, where a nickname puts your score on the board. That is also when Ranked mode was split off: change the difficulty freely in Practice, but scores only count under identical conditions.</p>
<p>The leaderboard brought new problems right away. How do you stop made-up scores? What about inappropriate nicknames? I added server rules that only accept scores that make sense, and limited nickname length and characters. These invisible parts took longer than the games.</p>

<h2>From web to app</h2>
<p>A web game's strength is that a link is all you need. Its weakness is getting people to come back. An icon on the home screen is what reminds you to play again, so I decided to make an app.</p>
<p>I did not rebuild it from scratch. The web game is wrapped in an app shell, so one set of game code serves both. The app screens were designed separately, though: buttons repositioned for a tall screen with no address bar, and features that give you a reason to return every day, like records and badges, added only to the app.</p>

<h2>Everything besides the game</h2>
<p>Making a game and releasing an app turned out to be different jobs. The list looked like this.</p>
<ul>
  <li><b>Developer accounts</b>: I joined the Apple Developer Program and paid the annual fee. The Google Play account needed identity and device verification.</li>
  <li><b>Business paperwork</b>: selling "Remove ads" inside the app requires business details, so I registered as a sole proprietor and filed the online sales registration required in Korea.</li>
  <li><b>Store pages</b>: name, description, search keywords and screenshots, in Korean and English. The store name says what the game is, so people searching for an arithmetic game can find it.</li>
  <li><b>Privacy policy</b>: required even with no sign-up, including what the ads use.</li>
  <li><b>Ads and purchases</b>: ads never interrupt a game. They appear only after one ends, and only sometimes. Ads that give an extra heart are entirely optional.</li>
</ul>

<h2>Review, then release</h2>
<p>Waiting for App Store review felt like the longest part. In November 2026 the approval email arrived. I searched the store for the name of my own app, saw the icon appear, and stared at the screen for a while.</p>

<h2>Why Android came later</h2>
<p>The plan was to launch on Android first. But Google Play requires new personal developer accounts to run a closed test with at least 12 testers for 14 days before a public release. For someone working alone, finding 12 people is a bigger task than it sounds. So the iPhone app went out first while the testers were gathered. The Android app will be released once testing is done.</p>

<h2>What I learned after launch</h2>
<p>Launch was the start, not the end, because people who actually played it began sending ideas. "It would be fun if only people with a link competed" became the <a href="/en/guide/group-match/">group challenge</a>. Badges turned out to be too easy to collect, so 12 became 24. A 3-2-1 countdown now runs when you resume from pause.</p>
<p>Working alone is slow because every decision is yours. But when someone says something is annoying, you can fix it that same day. That is the best part of doing it solo.</p>

<h2>What's next</h2>
<p>The Android release and new game modes. If something bothers you or you have an idea, write to <a href="mailto:jhl.studio.00@gmail.com">jhl.studio.00@gmail.com</a>. Messages are read, and what can be fixed gets fixed.</p>

<div class="tip"><p><b>Get the app</b> — <a href="https://apps.apple.com/app/id6826497198">SumSum Playground on the App Store</a>. See <a href="/en/guide/app-vs-web/">what the app adds</a>.</p></div>
'''},
{
'slug': 'math-game-for-everyone', 'cat': 'story', 'mins': 4,
'title': 'Why this is a math game for adults too',
'desc': 'Why SumSum Playground is built as an arcade game for all ages instead of a learning program for one age group, and the design rules that follow from that.',
'body': '''
<p class="lead">"Math game" usually suggests homework for primary school. SumSum Playground was never built that way. A seven-year-old, a thirty-year-old and a seventy-year-old play on the same screen under the same rules.</p>

<h2>You use arithmetic for life</h2>
<p>Splitting a bill, working out a sale price, counting the time left. The math adults use most is still adding, subtracting, multiplying and dividing. With a calculator always nearby, plenty of adults hesitate at 7 × 8. That is not lack of ability, only lack of use, and it comes back after a few games.</p>

<h2>The rules that follow</h2>
<h3>Scores, not stickers</h3>
<p>If "Great job!" pops up after every answer, adults close the tab. SumSum Playground speaks like an arcade game: score, record, rank. When you do well the number goes up, and that is enough.</p>
<h3>No setup</h3>
<p>No sign-up, no tutorial. Pick a game, tap, and it starts after 3, 2, 1. A game takes about a minute, short enough for an elevator wait.</p>
<h3>You choose the difficulty</h3>
<p>In Practice you pick the operations, the number range and the speed. Slow single-digit addition is fine. So is all four operations at top speed. Nothing is locked to an age.</p>
<h3>Rankings under identical conditions</h3>
<p>Ranked games are the same for everyone, so students and office workers sit side by side in the Hall of Fame. A child who just learned the times tables really can beat a parent.</p>

<h2>Who it suits</h2>
<ul>
  <li><b>Commuters</b>: one game instead of the news. A minute is enough to wake your head up.</li>
  <li><b>People studying for exams</b>: use it for <a href="/en/guide/speed-and-accuracy/">accuracy practice</a> to cut careless errors.</li>
  <li><b>Parents and kids</b>: competing in the same game turns homework into play.</li>
  <li><b>Older adults</b>: a little daily practice reading numbers and answering quickly.</li>
  <li><b>Friends</b>: settle a bet with a <a href="/en/guide/group-match/">group challenge</a>.</li>
</ul>

<h2>If you are new, try this order</h2>
<ol>
  <li>Warm up with <b>True or False</b>. Two buttons only.</li>
  <li>See how many you get in a minute in <b>Time Challenge</b>.</li>
  <li>Get past level 3 in <b>Falling Problems</b>. That is where it becomes a real game.</li>
  <li>Once it feels familiar, post a score in Ranked.</li>
</ol>
<p>If your mental math feels rusty, read <a href="/en/guide/mental-math-for-adults/">Mental math for adults</a> next.</p>
'''},
{
'slug': 'mental-math-for-adults', 'cat': 'learn', 'mins': 5,
'title': 'Mental math for adults — 7 everyday calculations',
'desc': 'Seven mental math shortcuts for daily life, from splitting a bill and sale prices to tips, tax and change, plus a three-minute daily routine to get your speed back.',
'body': '''
<p class="lead">Even with a calculator in your pocket, it helps to estimate in your head first. You can tell at once whether a receipt is right or a discount is worth it. These are not school methods, only the shortcuts adults actually use.</p>

<h2>1. Add from the left</h2>
<p>Written addition starts from the ones, but in your head the big digits come first. If you stop halfway you already have a rough answer.</p>
<div class="calc">4,800 + 3,700
→ 4,000 + 3,000 = 7,000
→ 800 + 700 = 1,500
→ 8,500</div>

<h2>2. Round, then adjust</h2>
<p>Three items at 9.90 is three at 10.00 minus 0.30.</p>
<div class="calc">9.90 × 3
→ 10 × 3 = 30
→ subtract 0.10 × 3 = 0.30
→ 29.70</div>

<h2>3. Sale prices: find what is left</h2>
<p>For 30% off, do not work out 30% and subtract. Go straight to 70%: find 10% and multiply by 7.</p>
<div class="calc">30% off 45
→ 10% is 4.50
→ 4.50 × 7 = 31.50</div>

<h2>4. Start from 10%</h2>
<p>10% is a shift of the decimal point. 5% is half of that, 15% is the two added together, 20% is double. That covers most tips and taxes.</p>

<h2>5. Split a bill by halving</h2>
<p>Four people means half of a half: 68 becomes 34, then 17. For three people, look for a nearby number that divides by 3. 68 is 66 + 2, so 22 each plus about 0.70.</p>

<h2>6. Count up for change</h2>
<p>100 − 63.50 involves a lot of borrowing. Count up from 63.50 instead: 0.50 to reach 64, 6 to reach 70, 30 to reach 100. That is 36.50.</p>

<h2>7. Break multiplication apart</h2>
<p>For two-digit multiplication, split one side into tens and ones.</p>
<div class="calc">24 × 15
→ 24 × 10 = 240
→ 24 × 5 = 120 (half of 240)
→ 360</div>
<p>To multiply by 5, multiply by 10 and halve. There are more in <a href="/en/guide/mental-math-tips/">Mental math tips</a>.</p>

<h2>Three minutes a day to get your speed back</h2>
<p>Knowing a shortcut is different from having it ready. The basics, like the times tables, have to come without thinking before the shortcuts get fast.</p>
<ol>
  <li><b>1 minute</b>: True or False, to read expressions quickly.</li>
  <li><b>1 minute</b>: Time Challenge with multiplication only, to bring the times tables back.</li>
  <li><b>1 minute</b>: Falling Problems, typing answers to check your accuracy.</li>
</ol>
<p>After a week your count will be clearly higher than on day one, and because scores are saved you can see it in numbers. For keeping it going, see <a href="/en/guide/five-minute-habit/">The five-minute habit</a>.</p>

<div class="tip"><p><b>Estimate first</b> — the most useful habit is thinking "roughly how much" before the exact answer. You will also notice straight away when you mistype a digit on a calculator.</p></div>
'''},
]

PAGES += [
{
'slug': 'arithmetic-games', 'cat': 'find', 'mins': 4,
'title': 'Arithmetic games — 6 free games you can play right now',
'desc': 'Six free arithmetic games with no install and no sign-up. Practice addition, subtraction, multiplication and division with falling problems, balloons, true or false and time attacks, and find the one that suits you.',
'body': '''
<p class="lead">If you are looking for arithmetic games, you can play six of them on SumSum Playground right now. They turn addition, subtraction, multiplication and division into arcade games, free, with no sign-up and nothing to install. They run on phones, tablets and computers.</p>

<h2>The six games at a glance</h2>
<div class="table-wrap"><table>
  <tr><th>Falling Problems</th><td>Type the answer before a problem reaches the floor. The level goes up every 20 correct answers.</td></tr>
  <tr><th>Time Challenge</th><td>Pick the right answer from 12 choices before time runs out. A wrong pick costs 5 points.</td></tr>
  <tr><th>60-Question Race</th><td>Timed until you get 60 right. Lower is better.</td></tr>
  <tr><th>Balloon Pop</th><td>Pop the balloon carrying the right answer as they float up.</td></tr>
  <tr><th>Beat the Clock</th><td>A right answer adds 2 seconds, a wrong one takes 3. See how long you last.</td></tr>
  <tr><th>True or False</th><td>Tap O if the equation is right, X if it is wrong. The fastest of the six.</td></tr>
</table></div>

<h2>Which one should you play?</h2>
<h3>You just want to try it</h3>
<p>Start with <a href="/en/guide/true-or-false/">True or False</a>. Two buttons, nothing to learn.</p>
<h3>You want arcade tension</h3>
<p><a href="/en/guide/falling-problems/">Falling Problems</a> puts several problems on screen at once, so you have to decide which to clear first. Higher levels are worth more points.</p>
<h3>You want a number for your speed</h3>
<p>The <a href="/en/guide/sixty-question-race/">60-Question Race</a> records a time, which makes it the easiest to compare with last week.</p>
<h3>You want better accuracy</h3>
<p><a href="/en/guide/beat-the-clock/">Beat the Clock</a> punishes mistakes heavily, which is good for breaking the habit of rushing.</p>
<h3>You are playing with a young child</h3>
<p><a href="/en/guide/balloon-pop/">Balloon Pop</a> needs no typing, only tapping.</p>

<h2>Choose the operations and difficulty</h2>
<p>In Practice you can switch each of the four operations on or off. Pick Easy, Normal or Hard, or set the number range yourself.</p>
<ul>
  <li><b>Easy</b>: addition and subtraction up to 10, multiplication and division up to the 5 times table</li>
  <li><b>Normal</b>: up to 20, and up to the 9 times table</li>
  <li><b>Hard</b>: up to 50, and up to the 12 times table</li>
</ul>
<p>There are five speeds from Very slow to Very fast. Division problems always divide evenly.</p>

<h2>Compete with others</h2>
<p>Ranked mode gives everyone identical conditions. A good score puts your nickname in the <b>Hall of Fame</b>. To compete only with people you know, create a room with the app's <a href="/en/guide/group-match/">group challenge</a>.</p>

<h2>Missed problems come back</h2>
<p>Problems you get wrong are remembered and appear more often in later games until you get them right. Just playing gives your weak spots extra repetition.</p>

<div class="tip"><p><b>There is an app too</b> — get it for iPhone and iPad on the <a href="https://apps.apple.com/app/id6826497198">App Store</a>. See <a href="/en/guide/app-vs-web/">what the app adds</a>.</p></div>
'''},
{
'slug': 'times-table-game', 'cat': 'find', 'mins': 4,
'title': 'Times tables game — learn them by playing, not chanting',
'desc': 'How to practice the times tables as a game. Set SumSum Playground to multiplication only, step up from the 5s to the 9s to the 12s, and pick from four games that suit multiplication facts.',
'body': '''
<p class="lead">Knowing the times tables means answering mixed-up questions instantly, not reciting them in order. Games shuffle the questions and keep them coming, which is exactly the practice multiplication facts need. Here is how to use SumSum Playground as a times tables game.</p>

<h2>Setting it up</h2>
<ol>
  <li>Pick any game on the home screen.</li>
  <li>Choose <b>Practice</b> and switch on <b>Multiply</b> only.</li>
  <li>Choose a level. <b>Easy</b> goes up to the 5 times table, <b>Normal</b> to the 9s, <b>Hard</b> to the 12s.</li>
  <li>Choose a speed and tap <b>Play</b>.</li>
</ol>
<p>You can also drag the number range slider to stop wherever you like, for example at the 7s.</p>

<h2>Four games that suit times tables</h2>
<div class="table-wrap"><table>
  <tr><th>Balloon Pop</th><td>For beginners. You only choose from the answers shown.</td></tr>
  <tr><th>True or False</th><td>Is "6 × 7 = 48" right? Trains you to spot near-miss answers.</td></tr>
  <tr><th>Time Challenge</th><td>How many in a minute? Easy to compare day to day.</td></tr>
  <tr><th>60-Question Race</th><td>You type each answer. The final check that the facts are automatic.</td></tr>
</table></div>

<h2>A step-by-step order</h2>
<h3>Step 1: 2s and 5s first (Easy)</h3>
<p>The 2s are doubling and the 5s end in 0 or 5. The patterns are visible, which builds confidence.</p>
<h3>Step 2: up to the 9s (Normal)</h3>
<p>Most people slow down at the 6s, 7s and 8s, especially 6 × 7, 6 × 8 and 7 × 8. Because missed problems come back more often, you will meet exactly those again and again.</p>
<h3>Step 3: mix in division</h3>
<p>Switch on both Multiply and Divide. Seeing 56 ÷ 7 and thinking of 7 × 8 makes the facts stick from both sides.</p>
<h3>Step 4: up to the 12s (Hard)</h3>
<p>The 11s and 12s help with time, dozens and quantities. Once 12 × 12 comes instantly, mental math gets noticeably easier.</p>

<h2>Adults too</h2>
<p>After a long break, adults stall at 7 × 8 as well. It comes back within days. Try Time Challenge on Multiply and Normal, and make 30 in a minute your first goal.</p>

<div class="tip"><p><b>Read more</b> — see <a href="/en/guide/times-tables/">the times tables guide</a> for understanding the facts, and <a href="/en/guide/division-help/">the division guide</a> for linking them to division.</p></div>
'''},
{
'slug': 'mental-math-game', 'cat': 'find', 'mins': 4,
'title': 'Mental math game — a three-minute daily routine',
'desc': 'How to use mental math games to build both speed and accuracy: the difference between choosing and typing answers, three-minute routines by level, and how to tell you are improving.',
'body': '''
<p class="lead">Mental math is more about repetition than tricks. You do the same kind of calculation often enough that the answer arrives without effort. A mental math game packs many problems into a short time, which is what that practice needs.</p>

<h2>Two kinds of mental math game</h2>
<div class="table-wrap"><table>
  <tr><th>Choosing</th><td>Time Challenge, Balloon Pop, True or False. You find the answer among options. Good for speed and for reading expressions quickly.</td></tr>
  <tr><th>Typing</th><td>Falling Problems, 60-Question Race. You enter the number yourself, so you must finish the calculation exactly. This shows your real level.</td></tr>
</table></div>
<p>Only choosing leads to guessing by estimate. Only typing gets tiring. Mix the two.</p>

<h2>Three-minute routines by level</h2>
<h3>It has been a while</h3>
<ol>
  <li>True or False · Add and Subtract · Easy (1 minute)</li>
  <li>Time Challenge · Add and Subtract · Normal (1 minute)</li>
  <li>Balloon Pop · Multiply · Easy (1 minute)</li>
</ol>
<h3>The basics are fine, you want speed</h3>
<ol>
  <li>Time Challenge · all four operations · Normal (1 minute)</li>
  <li>Beat the Clock · all four operations · Normal (as long as you last)</li>
  <li>60-Question Race · Multiply and Divide · Normal</li>
</ol>
<h3>You are confident</h3>
<ol>
  <li>Falling Problems · all four operations · Hard · Fast</li>
  <li>Ranked mode, aiming for the Hall of Fame</li>
</ol>

<h2>How to tell you are improving</h2>
<ul>
  <li><b>90% accuracy</b>: when the result screen shows over 90%, raise the level or the speed one step.</li>
  <li><b>Time Challenge count</b>: same settings, more correct than a week ago.</li>
  <li><b>60-Question time</b>: a falling time means basic facts are becoming automatic.</li>
  <li><b>Missed list</b>: problems that stay on it are your current weak spots.</li>
</ul>

<h2>The common mistake</h2>
<p>Going faster at the cost of accuracy makes you slower, because fixing a wrong answer takes longer than getting it right. Speed follows once accuracy is settled. See <a href="/en/guide/speed-and-accuracy/">speed and accuracy</a>.</p>

<div class="tip"><p><b>Tricks as well</b> — adding from the left, making tens and more are in <a href="/en/guide/mental-math-tips/">Mental math tips</a> and <a href="/en/guide/mental-math-for-adults/">Mental math for adults</a>.</p></div>
'''},
{
'slug': 'brain-game', 'cat': 'find', 'mins': 3,
'title': 'Brain game — a one-minute workout with numbers',
'desc': 'A light number-based brain game for commutes and breaks. See which of the six SumSum Playground games uses focus, quick judgment or steady nerves, and when each one fits.',
'body': '''
<p class="lead">A brain game does not have to be a long, hard puzzle. Doing easy calculations quickly, one after another, already keeps your head busy. A game on SumSum Playground lasts about a minute, so it fits into any gap in the day.</p>

<h2>Each game uses something different</h2>
<div class="table-wrap"><table>
  <tr><th>True or False</th><td>Snap judgment. Decide at once whether an equation holds.</td></tr>
  <tr><th>Falling Problems</th><td>Prioritizing. Deal with the most urgent of several problems.</td></tr>
  <tr><th>Balloon Pop</th><td>Hand-eye coordination. Find and tap the answer among moving balloons.</td></tr>
  <tr><th>Beat the Clock</th><td>Staying calm. Avoid mistakes while the time drains away.</td></tr>
  <tr><th>Time Challenge</th><td>Fast scanning. Find one answer among 12.</td></tr>
  <tr><th>60-Question Race</th><td>Stamina. Hold the same focus from start to finish.</td></tr>
</table></div>

<h2>When to play</h2>
<ul>
  <li><b>Slow morning</b>: one game of True or False is enough.</li>
  <li><b>Sleepy after lunch</b>: you cannot sit still in Falling Problems.</li>
  <li><b>Cannot settle into work</b>: the 60-Question Race brings back the feeling of doing one thing only.</li>
  <li><b>Winding down</b>: Balloon Pop at a slow speed.</li>
</ul>

<h2>Same rules for everyone</h2>
<p>SumSum Playground is not divided by age. Children, office workers and grandparents play on the same screen with the same rules. You choose the difficulty in Practice, and Ranked is identical for all. Families can compete in one room with a <a href="/en/guide/group-match/">group challenge</a>.</p>

<h2>Keeping it up</h2>
<p>Short and often beats long and rare. Attach it to a fixed moment of the day, like brushing your teeth. The app counts the days you play in a row and adds a bonus heart on a 7-day streak. More in <a href="/en/guide/five-minute-habit/">The five-minute habit</a>.</p>

<div class="tip"><p><b>Note</b> — SumSum Playground is a game played for fun. It gives you calculation practice and a minute of focus, and it is not a program for preventing or treating any condition.</p></div>
'''},
{
'slug': 'addition-subtraction-game', 'cat': 'find', 'mins': 4,
'title': 'Addition and subtraction game — up to 10, 20 and 50',
'desc': 'How to set up a game with only addition and subtraction, what changes at each number range (10, 20, 50), and which games are best for practicing carrying and borrowing.',
'body': '''
<p class="lead">Addition and subtraction are the base of all calculation. On SumSum Playground you can play with addition only, subtraction only, or both. What you practice changes with the number range, so choose the step that fits.</p>

<h2>Setting it up</h2>
<ol>
  <li>Pick a game and choose <b>Practice</b>.</li>
  <li>Switch on only <b>Add</b> and <b>Subtract</b>, or just one of them.</li>
  <li>Choose a level, or drag the number range slider.</li>
</ol>

<h2>What each range practices</h2>
<div class="table-wrap"><table>
  <tr><th>Up to 10 (Easy)</th><td>Single-digit sums like 3 + 4 and 9 − 5. No carrying. This builds number sense.</td></tr>
  <tr><th>Up to 20 (Normal)</th><td>8 + 7 and 15 − 9 bring in carrying and borrowing. The step worth the most time.</td></tr>
  <tr><th>Up to 50 (Hard)</th><td>Two-digit sums like 27 + 18 and 43 − 26. Mental strategies start to matter.</td></tr>
</table></div>

<h2>Games for each step</h2>
<h3>Up to 10: Balloon Pop</h3>
<p>No typing, only choosing. Set the speed to Very slow for time to think.</p>
<h3>Up to 20: Falling Problems and Time Challenge</h3>
<p>For 8 + 7, give 2 to the 8 to make 10, then add the remaining 5. Practice that by typing answers in Falling Problems, and check your speed in Time Challenge. The method is explained in <a href="/en/guide/carrying-and-borrowing/">carrying and borrowing</a>.</p>
<h3>Up to 50: 60-Question Race</h3>
<p>Add the tens first. 27 + 18 is 20 + 10 = 30, then 7 + 8 = 15, so 45. After 60 of these the steps get clearly faster.</p>

<h2>If subtraction is the hard part</h2>
<p>It is normal for subtraction to be slower. Try two things.</p>
<ul>
  <li><b>Think of it as addition</b>: 15 − 9 becomes "9 plus what makes 15?"</li>
  <li><b>Play subtraction only</b>: in a mix you score with the additions. Switch on Subtract alone and work up from Easy.</li>
</ul>

<h2>For adults</h2>
<p>Try Beat the Clock on Hard. Keeping a run of two-digit sums going without a slip is not easy for adults either, and it speeds up estimating a total while shopping.</p>

<div class="tip"><p><b>Next step</b> — once this is comfortable, move on to the <a href="/en/guide/times-table-game/">times tables game</a>.</p></div>
'''},
{
'slug': 'math-game-with-friends', 'cat': 'find', 'mins': 3,
'title': 'Math games to play with friends — 3 ways to compete',
'desc': 'Three ways to compete at math games with friends, family or classmates: the Ranked Hall of Fame, invite-only group challenges, and taking turns on one device.',
'body': '''
<p class="lead">Alone, a calculation game is practice. With other people, it is a contest. Here are the ways to compete on SumSum Playground, by situation.</p>

<h2>1. Against everyone: Ranked and the Hall of Fame</h2>
<p>Pick a game and start it in <b>Ranked</b>. Everyone gets identical conditions: Normal level, all four operations, default speed. A top score lets you put a nickname in the <b>Hall of Fame</b>. Each of the six games has its own board, so being good at one is enough.</p>

<h2>2. Against people you know: group challenge</h2>
<p>Create a room in the app and send the link. Only people with the link are ranked.</p>
<ul>
  <li>One room covers all six games.</li>
  <li>Everyone gets the same problems for the day, so it is fair.</li>
  <li>The ranking restarts every 3 days, so anyone can take first place again.</li>
  <li>Invited players can join on the web without the app.</li>
</ul>
<p>Post the link in a group chat and people will play a game when it suits them and check the standings. Details are in the <a href="/en/guide/group-match/">group challenge guide</a>.</p>

<h2>3. In the same room: take turns</h2>
<p>With one device, take turns. Use the same Practice settings and compare scores.</p>
<ul>
  <li><b>One-minute duel</b>: Time Challenge lasts exactly a minute, so nobody waits long.</li>
  <li><b>60-question relay</b>: two people alternate every 10 problems for a team time.</li>
  <li><b>True or False with hands</b>: put it on a big screen and have everyone signal O or X.</li>
</ul>

<h2>When skill levels differ</h2>
<p>An adult against a child, or an expert against a beginner, stops being fun quickly. Give each player a different level in Practice, one on Hard and one on Easy, and compare the scores.</p>

<h2>Ideas for stakes</h2>
<ul>
  <li>Last place when the 3-day round ends buys the coffee</li>
  <li>The family room winner picks dinner</li>
  <li>Write each round's winner on the classroom board</li>
</ul>

<div class="tip"><p><b>Share a result</b> — after a Ranked game you can send a challenge with your score and ask a friend to beat it.</p></div>
'''},
]
