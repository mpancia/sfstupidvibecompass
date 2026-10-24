// Placements and faction write-ups are our editorial read, which is the joke.

// x: loves markets or whatever (-1) to cares about people (+1).
// y: midwit dumb guys (-1) to smart guys (+1).
// s: +1 means agreeing moves you toward the positive end of the axis.
export const QS = [
  { ax:"x", s:+1, t:"Housing is a human right, even if a guy named Tyler on Twitter says the real human right is upzoning." },
  { ax:"y", s:-1, t:"The answer to every problem is \u201cbuild more,\u201d including loneliness and police violence." },
  { ax:"x", s:-1, t:"A 60-story tower with four \u201cbelow-market-rate\u201d units is basically public housing if you squint." },
  { ax:"y", s:-1, t:"More cops reduce crime, according to a study funded by the cops." },
  { ax:"x", s:+1, t:"Landlords provide housing the same way scalpers provide concert tickets." },
  { ax:"y", s:+1, t:"A pro-housing group funded by real-estate developers might have interests." },
  { ax:"x", s:-1, t:"Rents will come down eventually, and anyone displaced in the meantime is a rounding error." },
  { ax:"y", s:-1, t:"License-plate cameras keep us safe, even if they mostly photograph the same unhoused guy 400 times a day." },
  { ax:"x", s:+1, t:"Vacant units should be seized, even if the owner is in Tahoe \u201cfor the season.\u201d" },
  { ax:"y", s:-1, t:"A quiz a chatbot wrote in four minutes can tell me how to vote." },
  { ax:"x", s:-1, t:"The best way to help renters is to make their landlord\u2019s building more valuable." },
  { ax:"y", s:+1, t:"I have read a book about housing that was not \u201cAbundance.\u201d" },
];

export const AXN = { x:"People", y:"Brains" };

export const LIKERT = [
  [2, "Strongly agree"],
  [1, "Agree"],
  [0, "Neutral (vest)"],
  [-1, "Disagree"],
  [-2, "Strongly disagree"],
];

export const QUADS = {
  tr: {
    name:"Correct", h:"You\u2019re Correct.", color:"#ff4a3d",
    blurb:"You want housing for people instead of for portfolios. You\u2019ve noticed who funds the \u201cpro-housing coalition.\u201d",
    words:["House people. Then keep them housed.", "Public safety means everyone has a home, food and a doctor. It does not mean a guy with a drone."],
    critics:["\u201cThis would never pencil.\u201d Nobody asked the pencil.", "\u201cBut rent is set by supply and demand.\u201d Sure. Who owns the supply?"],
  },
  br: {
    name:"Nonprofit Brain", h:"You have Nonprofit Brain.", color:"#ffb347",
    blurb:"Your heart is in the right place. Your money is in a $40 million navigation center with 12 beds.",
    words:["We hear you, and we are convening a working group to center your voice.", "Our strategic plan has seven pillars and zero units."],
    critics:["Spent the housing money on a consultant who recommended more consultants.", "Will put out a statement. Will not put out a fire."],
  },
  tl: {
    name:"Evil Genius", h:"You\u2019re an Evil Genius.", color:"#b48cff",
    blurb:"You know exactly what you\u2019re doing. Your family owns a third of the Mission and calls it \u201cstewardship.\u201d",
    words:["Housing is an asset class, and assets should appreciate.", "We support the unhoused by funding the cameras that watch them."],
    critics:["Has never once been the victim of a market.", "Calls a rent increase \u201cprice discovery.\u201d"],
  },
  bl: {
    name:"Supply-Side Sicko", h:"You\u2019re a Supply-Side Sicko.", color:"#4fc3f7",
    blurb:"You\u2019ve read \u201cAbundance\u201d four times. You believe a luxury tower is a public good if it\u2019s tall enough.",
    words:["We just need to build more.", "Have you seen this chart? The line goes up."],
    critics:["Thinks the cops and the cranes are both infrastructure.", "Would upzone a cemetery and call it filtering."],
  },
  c: {
    name:"Patagonia Vest", h:"You have a Patagonia Vest.", color:"#a8a49a",
    blurb:"You split the difference on whether people deserve homes. The compass can\u2019t help you. Nothing can.",
    words:["There are good points on both sides of eviction.", "I\u2019m socially liberal, but I own a duplex."],
    critics:["Votes however the Chronicle says, then complains about it at brunch.", "Thinks \u201cmoderate\u201d is a policy."],
  },
};

// l: put the label on the left of the dot.
export const ENT = [
  { n:"DSA SF", x:.85, y:.78, d:"Socialists", l:true },
  { n:"Tenants Union", x:.75, y:.6, d:"Tenant organizers", l:true },
  { n:"Mayor Lurie", x:-.4, y:-.88, d:"Mayor, Levi\u2019s heir" },
  { n:"SF Democrats", x:.35, y:-.6, d:"Party" },
  { n:"Chronicle ed. board", x:-.05, y:-.25, d:"Newspaper" },
  { n:"Scott Wiener", x:-.45, y:-.35, d:"State senator" },
  { n:"Abundance Network", x:-.9, y:-.47, d:"Voter guide" },
  { n:"GrowSF", x:-.62, y:-.58, d:"Voter guide" },
  { n:"YIMBY Action", x:-.8, y:-.72, d:"Voter guide" },
  { n:"SFPOA", x:-.85, y:-.92, d:"Police union" },
  { n:"A chatbot", x:.05, y:-.85, d:"Thinks it\u2019s neutral" },
  { n:"Peter Thiel\u2019s reading list", x:-.55, y:.72, d:"Mostly his own" },
  { n:"A guy with a Substack", x:-.3, y:.4, d:"Smart, he\u2019ll tell you", l:true },
  { n:"Guys who use Latin logical fallacies", x:.7, y:-1.1, d:"Ad hominem, post hoc, QED", l:true },
  { n:"Garry Tan", x:-1.1, y:-1.1, d:"Y Combinator, off the chart" },
];

// None of these are on any real ballot. m: each slate's pick, Y, N or "." for no pick.
export const PROPS = [
  { lab:"Prop \u03a9", ttl:"Make the landlord sad", desc:"Every rent increase must be delivered in person, with a 30-minute apology and a handwritten card.", m:{ tr:"Y", br:"Y", tl:"N", bl:"N", c:"N" } },
  { lab:"Prop $", ttl:"One (1) very tall tower", desc:"Builds a single 90-story luxury tower in the Mission to see what happens. Four below-market-rate units, by lottery, on the parking level.", m:{ tr:"N", br:"Y", tl:"Y", bl:"Y", c:"Y" } },
  { lab:"Prop \u2302", ttl:"Police academy to housing", desc:"Turns the police academy into 400 homes. Officers may apply for them like everyone else.", m:{ tr:"Y", br:"Y", tl:"N", bl:"N", c:"N" } },
  { lab:"Prop LPR", ttl:"A camera on every lamppost", desc:"Adds 10,000 license-plate cameras, which will find the same Honda Civic very efficiently.", m:{ tr:"N", br:".", tl:"Y", bl:"Y", c:"Y" } },
  { lab:"Prop \u221e", ttl:"Rename rent", desc:"Renames rent to the \u201cabundance fee.\u201d Does not change the amount.", m:{ tr:"N", br:".", tl:"Y", bl:"Y", c:"." } },
  { lab:"Prop 40M", ttl:"A $40 million navigation center", desc:"Builds a navigation center with 12 beds, a mural and an executive director.", m:{ tr:"N", br:"Y", tl:"N", bl:"N", c:"Y" } },
  { lab:"Prop \u262d", ttl:"Seize vacant units", desc:"Units empty for more than six months go to people who need them. The owner keeps the Tahoe place.", m:{ tr:"Y", br:".", tl:"N", bl:"N", c:"N" } },
  { lab:"Prop McK", ttl:"Hire consultants", desc:"Pays a consulting firm $12 million to find out why everything costs so much.", m:{ tr:"N", br:"Y", tl:"Y", bl:"Y", c:"Y" } },
];

export const SLATES = [
  { q:"tr", name:"The Correct Guide" },
  { q:"br", name:"Nonprofit Brain Coalition" },
  { q:"tl", name:"Evil Genius PAC" },
  { q:"bl", name:"Supply-Side Sicko Slate Card" },
  { q:"c", name:"Patagonia Vest Endorsements" },
];
