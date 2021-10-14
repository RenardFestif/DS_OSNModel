/**
 * CONST FILE
 */

export const DEFAULT_SCORE = 50;

export const MU_NATURE = 0;
export const SIGMA_NATURE = 1;

export const TRUTHFULL_MALICIOUS_RATIO = 1;
export const NATURE_TRUTHFULL_THRESHOLD = 1;
export const NATURE_MALICIOUS_THRESHOLD = MU_NATURE - (NATURE_TRUTHFULL_THRESHOLD * TRUTHFULL_MALICIOUS_RATIO);

export const SIGMA_VERACITY = 0.05;

export const PUBLIC_POSTS = 20;
export const PUBLIC_THRESHOLD = 0.33;
export const PUBLIC_SIGMA = 0.05;

export const NUMBER_USERS = 100;
export const TOP_CONNECTED_PERCENTAGE = 33;
export const SMOOTHER_PERCENTAGE = 1;
export const MIN_Y_ADJUST = (SMOOTHER_PERCENTAGE / 100) * NUMBER_USERS;
// Fist Approach we suppose that each user post the same amount of content
export const POSTS_PER_USER = 10;
export const NB_ROUNDS = 500;

// Fake news are 70% more likely to be retweeted
export const FAKE_RETWEET_MULTIPLICATOR = 0.7;
// export const FAKE_RETWEET_MULTIPLICATOR_FACTOR = 100 / FAKE_RETWEET_MULTIPLICATOR;
// MORE THAN THAT THE USER RETWEETS
export const DEFAULT_FAKE_RETWEET_TRESHOLD = 0.5;

export const AVERAGE_RETWEET_PER_USER_PER_UNIT_OF_TIME = 0.02;

export const NB_ROUNDS_ANALYSIS = 10;
