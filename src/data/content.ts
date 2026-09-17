export type Category = { slug: string; name: string; description: string; accent: string; progress: number }
export type Concept = { slug: string; name: string; category: string; description: string; status: 'locked' | 'available' | 'learning' | 'mastered'; progress: number; x: number; y: number; related: string[] }
export type Course = { slug: string; title: string; category: string; description: string; lessons: string[]; hours: number; progress: number }
export type TimelineItem = { slug: string; year: number; title: string; category: string; region: string; description: string }

export const categories: Category[] = [
  {slug:'economics',name:'Economics',description:'Money, production, incentives, markets and economic systems.',accent:'economics',progress:32},
  {slug:'history',name:'History',description:'How civilizations, institutions, conflicts and ideas shaped the modern world.',accent:'history',progress:18},
  {slug:'government',name:'Government & Politics',description:'How governments, elections, institutions and public policy operate.',accent:'government',progress:24},
  {slug:'finance',name:'Finance',description:'Personal finance, investing, banking, debt and financial markets.',accent:'finance',progress:40},
  {slug:'geopolitics',name:'Geopolitics',description:'Power, geography, trade, resources and international relations.',accent:'geopolitics',progress:8},
  {slug:'science',name:'Science',description:'The physical and biological systems behind our world.',accent:'science',progress:11},
  {slug:'technology',name:'Technology',description:'Computing, AI, infrastructure, cybersecurity and emerging technologies.',accent:'technology',progress:16},
  {slug:'law',name:'Law',description:'Legal systems, rights, contracts and institutions.',accent:'law',progress:12},
  {slug:'philosophy',name:'Philosophy',description:'Ideas about truth, ethics, society and human existence.',accent:'philosophy',progress:9},
  {slug:'psychology',name:'Psychology',description:'Human behavior, decisions, cognition and social influence.',accent:'psychology',progress:14},
  {slug:'critical-thinking',name:'Critical Thinking',description:'Biases, fallacies, statistics, misinformation and reasoning.',accent:'critical',progress:21},
  {slug:'life-skills',name:'Life Skills',description:'Taxes, mortgages, employment, insurance and practical knowledge.',accent:'skills',progress:26},
]

type RawConcept = [string, string, string, string, number, number, string[]]

const rawConcepts: RawConcept[] = [
  // Fundamentos de Economía (Top Left)
  ['scarcity', 'Scarcity', 'economics', 'Resources are limited while human wants extend beyond what is available.', 14, 15, ['choice', 'opportunity-cost', 'productivity']],
  ['choice', 'Choice', 'economics', 'Selecting among alternatives when not everything is possible.', 28, 14, ['scarcity', 'opportunity-cost', 'trade']],
  ['opportunity-cost', 'Opportunity Cost', 'economics', 'The value of the best alternative you give up.', 23, 27, ['choice', 'trade', 'comparative-advantage']],
  ['productivity', 'Productivity', 'economics', 'Output produced per unit of input.', 12, 32, ['scarcity', 'capital', 'specialization']],
  ['capital', 'Capital', 'economics', 'Productive assets used to create goods and services.', 18, 44, ['productivity', 'investment', 'saving']],
  ['specialization', 'Specialization', 'economics', 'Concentrating effort where production is most effective.', 33, 24, ['productivity', 'trade', 'comparative-advantage']],
  ['trade', 'Trade', 'economics', 'Voluntary exchange that can benefit both sides.', 44, 16, ['choice', 'specialization', 'comparative-advantage', 'markets', 'money']],
  ['comparative-advantage', 'Comparative Advantage', 'economics', 'Producing at a lower opportunity cost than another producer.', 36, 36, ['specialization', 'opportunity-cost', 'trade']],
  
  // Mercados y Dinero (Center)
  ['money', 'Money', 'economics', 'A medium of exchange, unit of account and store of value.', 56, 14, ['trade', 'prices', 'banking', 'inflation']],
  ['prices', 'Prices', 'economics', 'Signals that coordinate choices across an economy.', 52, 26, ['money', 'supply', 'demand', 'markets']],
  ['supply', 'Supply', 'economics', 'The quantity producers are willing to offer.', 45, 38, ['prices', 'demand', 'markets']],
  ['demand', 'Demand', 'economics', 'The quantity consumers are willing to buy.', 58, 38, ['prices', 'supply', 'markets']],
  ['markets', 'Markets', 'economics', 'Systems through which buyers and sellers exchange.', 51, 50, ['prices', 'supply', 'demand', 'labor-markets', 'trade']],
  ['labor-markets', 'Labor Markets', 'economics', 'Where workers and employers exchange labor for compensation.', 42, 62, ['markets', 'productivity']],
  ['gdp', 'GDP', 'economics', 'The market value of final goods and services produced.', 64, 28, ['markets', 'productivity', 'inflation']],
  ['inflation', 'Inflation', 'economics', 'A sustained increase in the general price level.', 70, 16, ['money', 'interest-rates', 'federal-reserve', 'gdp']],
  
  // Finanzas y Capital (Center-Bottom a Derecha)
  ['saving', 'Saving', 'finance', 'Resources set aside rather than consumed now.', 24, 58, ['capital', 'investment', 'banking']],
  ['investment', 'Investment', 'finance', 'Committing resources today to increase future capacity.', 32, 70, ['saving', 'capital', 'compound-interest']],
  ['compound-interest', 'Compound Interest', 'finance', 'Returns calculated on principal and accumulated returns.', 44, 76, ['investment', 'saving', 'interest-rates']],
  ['banking', 'Banking', 'finance', 'Institutions that safeguard money and connect savers with borrowers.', 66, 44, ['money', 'saving', 'interest-rates', 'federal-reserve']],
  ['interest-rates', 'Interest Rates', 'finance', 'The price of borrowing and reward for lending.', 78, 28, ['banking', 'inflation', 'federal-reserve', 'compound-interest']],
  
  // Gobierno e Instituciones (Top Right)
  ['constitution', 'U.S. Constitution', 'government', 'The foundational framework of the United States government.', 92, 14, ['separation-of-powers', 'congress']],
  ['separation-of-powers', 'Separation of Powers', 'government', 'Dividing state power among distinct branches.', 84, 24, ['constitution', 'congress']],
  ['congress', 'Congress', 'government', 'The legislative branch of the United States.', 94, 34, ['constitution', 'separation-of-powers']],
  ['federal-reserve', 'Federal Reserve', 'government', 'The central bank of the United States.', 82, 42, ['interest-rates', 'banking', 'congress', 'inflation']],
  
  // Historia y Transformaciones (Bottom Left)
  ['industrial-revolution', 'Industrial Revolution', 'history', 'The transformation from hand production to mechanized industry.', 12, 62, ['productivity', 'capital', 'energy']],
  ['great-depression', 'Great Depression', 'history', 'A severe worldwide economic contraction beginning in 1929.', 16, 76, ['banking', 'gdp', 'world-war-two']],
  ['world-war-two', 'World War II', 'history', 'The global conflict fought from 1939 to 1945.', 26, 88, ['great-depression', 'energy']],
  
  // Tecnología y Ciencia (Bottom Center-Right)
  ['energy', 'Energy', 'science', 'The capacity to do work and a foundation of modern systems.', 58, 76, ['industrial-revolution', 'productivity', 'artificial-intelligence']],
  ['artificial-intelligence', 'Artificial Intelligence', 'technology', 'Machines performing tasks associated with human intelligence.', 72, 68, ['productivity', 'energy']],
  
  // Pensamiento Crítico (Right-Bottom)
  ['confirmation-bias', 'Confirmation Bias', 'critical-thinking', 'Favoring information that supports existing beliefs.', 86, 56, ['correlation-causation']],
  ['correlation-causation', 'Correlation vs. Causation', 'critical-thinking', 'Distinguishing association from a causal relationship.', 90, 70, ['confirmation-bias']],
]

export const concepts: Concept[] = rawConcepts.map((c, i) => ({
  slug: c[0],
  name: c[1],
  category: c[2],
  description: c[3],
  status: i < 3 ? 'mastered' : i < 9 ? 'learning' : i < 21 ? 'available' : 'locked',
  progress: i < 3 ? 100 : i < 9 ? 30 + i * 5 : 0,
  x: c[4],
  y: c[5],
  related: c[6],
}))

export const economicsLessons = ['Robinson Crusoe and the Birth of Economic Thinking','Scarcity — Why You Cannot Have Everything','Choices and Trade-Offs','Opportunity Cost','Productivity','Specialization','Trade','Money','Prices','Markets']
export const courses: Course[] = [
{slug:'economics-foundations',title:'Economics Foundations',category:'Economics',description:'Understand economic thinking before learning economic equations.',lessons:economicsLessons,hours:6,progress:42},
{slug:'american-government',title:'How American Government Works',category:'Government',description:'Institutions, powers, elections and public policy.',lessons:['The Constitution','Congress','The Presidency','The Supreme Court'],hours:8,progress:24},
{slug:'road-to-world-war-two',title:'The Road to World War II',category:'History',description:'Trace the choices and forces that led to global war.',lessons:['Versailles','The Great Depression','Rise of Dictatorships','War Begins'],hours:5,progress:18},
{slug:'personal-finance',title:'Personal Finance Essentials',category:'Finance',description:'Build practical confidence with money and markets.',lessons:['Budgeting','Compound Interest','Credit','Mortgages'],hours:7,progress:40},
{slug:'think-better',title:'Think Better',category:'Critical Thinking',description:'Recognize bias, evidence and faulty reasoning.',lessons:['Claims and Evidence','Cognitive Biases','Correlation','Statistics'],hours:6,progress:12},
]
export const paths = [
{slug:'economics-from-zero',title:'Economics From Zero',lessons:17,hours:6,category:'Economics'},
{slug:'us-government',title:'Understand American Government',lessons:21,hours:8,category:'Government'},
{slug:'modern-history',title:'Understand Modern History',lessons:15,hours:5,category:'History'},
{slug:'financial-foundations',title:'Build Financial Foundations',lessons:19,hours:7,category:'Finance'},
{slug:'better-thinker',title:'Become a Better Thinker',lessons:24,hours:8,category:'Critical Thinking'},
]
export const timeline: TimelineItem[] = [
{slug:'declaration-independence',year:1776,title:'American Declaration of Independence',category:'Politics',region:'United States',description:'Thirteen colonies declared independence from Great Britain.'},{slug:'french-revolution',year:1789,title:'French Revolution',category:'Politics',region:'Europe',description:'Political and social transformation reshaped France and Europe.'},{slug:'american-civil-war',year:1861,title:'American Civil War',category:'War',region:'United States',description:'Conflict over union, slavery and federal power.'},{slug:'world-war-one',year:1914,title:'World War I',category:'War',region:'World',description:'Industrialized war transformed states and societies.'},{slug:'great-depression',year:1929,title:'Great Depression',category:'Economics',region:'World',description:'A worldwide collapse in output, employment and trade.'},{slug:'world-war-two',year:1939,title:'World War II',category:'War',region:'World',description:'The deadliest conflict in human history.'},{slug:'united-nations',year:1945,title:'United Nations Founded',category:'Politics',region:'World',description:'A new institution for international cooperation.'},{slug:'moon-landing',year:1969,title:'Moon Landing',category:'Science',region:'United States',description:'Apollo 11 put humans on the Moon.'},{slug:'berlin-wall',year:1989,title:'Fall of the Berlin Wall',category:'Politics',region:'Europe',description:'A defining symbol of the Cold War opened.'},{slug:'soviet-dissolution',year:1991,title:'Dissolution of the Soviet Union',category:'Politics',region:'World',description:'The Soviet state formally ceased to exist.'},{slug:'financial-crisis',year:2008,title:'Global Financial Crisis',category:'Economics',region:'World',description:'Financial instability spread through the global economy.'},{slug:'ai-breakthrough',year:2022,title:'Generative AI Goes Mainstream',category:'Technology',region:'World',description:'Generative systems entered widespread public use.'},
]
export const achievements = ['Island Economist','Inflation Explained','Constitutional Thinker','Time Traveler','Market Mind','Skeptic','Global Strategist','Renaissance Mind','Seven-Day Scholar','The Century']
export const dailyQuestions = [
{q:'If the Federal Reserve raises interest rates, which effect is generally expected first?',a:['Borrowing becomes cheaper','Borrowing becomes more expensive','Taxes automatically fall','Scarcity disappears'],correct:1},
{q:'What does opportunity cost measure?',a:['Only money spent','The best alternative forgone','All possible choices','A government fee'],correct:1},
{q:'Which branch writes federal laws?',a:['Judicial','Executive','Legislative','Central bank'],correct:2},
{q:'What makes compound interest compound?',a:['Returns earn further returns','Prices never change','Debt is cancelled','Taxes are fixed'],correct:0},
{q:'Correlation alone proves what?',a:['Causation','Association, not causation','Intent','Nothing was measured'],correct:1},
{q:'A sustained rise in the general price level is called?',a:['Productivity','Inflation','Liquidity','Specialization'],correct:1},
{q:'A constitution primarily establishes?',a:['Daily prices','A framework of government','Scientific laws','Market demand'],correct:1},
{q:'Specialization can raise total output because?',a:['Resources become unlimited','People focus on relative strengths','Money disappears','Risk becomes zero'],correct:1},
]
