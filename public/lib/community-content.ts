export const examples = [
 {id:"question",type:"Question",topic:"Python",title:"What’s a good way to handle missing data?",body:"I’m working through a small dataset and would love to hear how others approach missing values.",author:"Example discussion"},
 {id:"project",type:"Project",topic:"Machine learning",title:"Exploring crop yield prediction with satellite data",body:"An example project looking at how open data can help us understand agricultural patterns.",author:"Example project"},
 {id:"idea",type:"Idea",topic:"Study groups",title:"What if we learned SQL together?",body:"An idea for a friendly, beginner-focused study group with a little practice each week.",author:"Example idea"},
 {id:"discussion",type:"Discussion",topic:"Getting started",title:"What helped you get started in data science?",body:"Share the resource, project or small breakthrough that made things click.",author:"Example discussion"}
] as const;
export const resources = [
 {title:"Python Tutorial",description:"Start with the language fundamentals in Python’s official documentation.",type:"Guide",topic:"Python",level:"Beginner",url:"https://docs.python.org/3/tutorial/"},
 {title:"Kaggle Learn",description:"Short practical lessons and exercises to build data skills.",type:"Course",topic:"Python",level:"Beginner",url:"https://www.kaggle.com/learn"},
 {title:"OpenIntro Statistics",description:"A freely available introduction to statistical thinking.",type:"Book",topic:"Statistics",level:"Beginner",url:"https://www.openintro.org/book/os/"},
 {title:"Machine Learning Crash Course",description:"Explore core machine learning concepts and practical exercises.",type:"Course",topic:"Machine Learning",level:"Beginner",url:"https://developers.google.com/machine-learning/crash-course"},
 {title:"Matplotlib tutorials",description:"Learn to create and customise visualisations in Python.",type:"Guide",topic:"Visualisation",level:"Intermediate",url:"https://matplotlib.org/stable/tutorials/index.html"},
 {title:"Kaggle Datasets",description:"Discover public datasets for your next exploration or project.",type:"Datasets",topic:"Projects",level:"All levels",url:"https://www.kaggle.com/datasets"}
] as const;
export const communityPreviewPosts = [
  {id:"preview-question",type:"Question",title:"Best way to handle imbalanced datasets?",body:"I'm working on a classification project with a skewed dataset. What techniques have worked well for you in practice?",author:"Priya S.",time:"2 hours ago",replies:12},
  {id:"preview-project",type:"Project",title:"Built a real-time data dashboard for campus bike usage",body:"Sharing a project I've been working on that visualizes live bike availability around campus using public data and Python.",author:"Arjun K.",time:"1 day ago",replies:8},
  {id:"preview-idea",type:"Idea",title:"Idea: Monthly mini data challenges?",body:"What do you think about short, themed data challenges each month? Could be a fun way to learn and collaborate!",author:"Leah M.",time:"2 days ago",replies:15},
];
