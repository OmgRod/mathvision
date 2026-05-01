export type TopicDimension = string | string[];

export interface MathTopic {
  name: string;
  category: TopicDimension;
  level: TopicDimension;
  description: string;
  time?: string;
  exams?: string[];
}

export const normalizeTopicDimension = (dimension: TopicDimension): string[] =>
  Array.isArray(dimension) ? dimension : [dimension];

export const getTopicLevels = (topic: MathTopic) => normalizeTopicDimension(topic.level);
export const getTopicCategories = (topic: MathTopic) => normalizeTopicDimension(topic.category);
export const formatTopicLevel = (topic: MathTopic) => getTopicLevels(topic).join(', ');
export const formatTopicCategory = (topic: MathTopic) => getTopicCategories(topic).join(', ');

export const findBestMatchingTopic = (query: string): string | null => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;
  const tokens = Array.from(new Set((normalizedQuery.match(/\b[a-z0-9]+\b/g) || []).map((token) => token.toLowerCase())));
  if (tokens.length === 0) return null;

  const scoreTopic = (topic: MathTopic) => {
    const haystack = [topic.name, topic.description, ...getTopicCategories(topic), ...getTopicLevels(topic)]
      .join(' ')
      .toLowerCase();

    let score = 0;
    if (haystack.includes(topic.name.toLowerCase())) {
      score += 10;
    }
    for (const token of tokens) {
      if (haystack.includes(token)) {
        score += token.length > 4 ? 3 : 1;
      }
    }
    return score;
  };

  let bestTopic: MathTopic | null = null;
  let bestScore = 0;
  for (const topic of PRACTICE_TOPICS) {
    const score = scoreTopic(topic);
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  if (!bestTopic || bestScore < 6) {
    return null;
  }

  return bestTopic.name;
};

/**
 * @deprecated Use PRACTICE_TOPICS as source of truth.
 * This is kept for backward compatibility but is empty.
 */
export const TOPIC_DATA: Record<string, { description: string, level: string, time: string }> = {};

export const PRACTICE_TOPICS: MathTopic[] = [
  // --- FOUNDATION & ARITHMETIC ---
  { name: "Place Value and Rounding", category: "Arithmetic", level: "Primary", description: "Understanding digits and rounding to powers of 10" },
  { name: "Long Addition and Subtraction", category: "Arithmetic", level: "Primary", description: "Column methods for large numbers" },
  { name: "Long Multiplication", category: "Arithmetic", level: "Middle School", description: "Multiplying multi-digit integers" },
  { name: "Short and Long Division", category: "Arithmetic", level: "Middle School", description: "Division algorithms including remainders" },
  { name: "Order of Operations (BIDMAS/PEMDAS)", category: "Arithmetic", level: "Middle School", description: "Evaluating expressions with brackets, indices, and mixed operators" },
  { name: "Negative Number Arithmetic", category: "Arithmetic", level: "Middle School", description: "Operations with positive and negative integers" },
  { name: "Fraction Simplification", category: "Arithmetic", level: "Middle School", description: "Finding equivalent fractions and simplest forms" },
  { name: "Adding and Subtracting Fractions", category: "Arithmetic", level: "Middle School", description: "Working with common denominators" },
  { name: "Multiplying and Dividing Fractions", category: "Arithmetic", level: "Middle School", description: "Fractional operations and reciprocal methods" },
  { name: "Mixed Numbers and Improper Fractions", category: "Arithmetic", level: "Middle School", description: "Converting between different fraction representations" },
  { name: "Percentage of an Amount", category: "Arithmetic", level: "Middle School", description: "Calculating 10%, 25%, 17.5%, etc.", exams: ["SAT Math", "11+ / Primary Excellence"] },
  { name: "FDP Conversions", category: "Arithmetic", level: "Middle School", description: "Converting between Fractions, Decimals, and Percentages", exams: ["11+ / Primary Excellence", "13+ / Scholarship Track"] },
  { name: "Recurring Decimals to Fractions", category: "Arithmetic", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Algebraic proof for converting repeating decimals", exams: ["AQA GCSE Further Maths", "GCSE Maths Higher"] },
  { name: "Ratio Sharing", category: "Arithmetic", level: "Middle School", description: "Dividing quantities into parts", exams: ["SAT Math", "11+ / Primary Excellence"] },
  { name: "Direct Proportion", category: "Arithmetic", level: ["Middle School", "AQA GCSE Further Maths"], description: "Relating variables that grow at the same rate", exams: ["AQA GCSE Further Maths"] },
  { name: "Inverse Proportion", category: "Arithmetic", level: "GCSE", description: "Relating variables where one grows as the other shrinks", exams: ["AQA GCSE Further Maths"] },
  { name: "Standard Form (Scientific Notation)", category: "Arithmetic", level: "GCSE", description: "Working with very large and very small numbers" },
  { name: "Upper and Lower Bounds", category: "Arithmetic", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Accuracy and error intervals for calculations" },
  { name: "Product of Prime Factors", category: "Arithmetic", level: "Middle School", description: "Prime decomposition and factor trees" },
  { name: "HCF and LCM (Venn Diagrams)", category: "Arithmetic", level: "Middle School", description: "Finding common factors and multiples" },
  { name: "Product Rule for Counting", category: "Number", level: ["GCSE", "AQA GCSE Further Maths"], description: "Calculating total outcomes using multiplication", exams: ["AQA GCSE Further Maths", "SAT Math"] },
  { name: "Surds (Addition and Subtraction)", category: "Number", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Simplifying and combining surd expressions", exams: ["AQA GCSE Further Maths"] },
  { name: "Surds (Rationalising Denominators)", category: "Number", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Removing surds from the bottom of fractions", exams: ["AQA GCSE Further Maths"] },

  // --- ALGEBRA (Levels: Middle School to Uni) ---
  { name: "Simplifying Algebraic Expressions", category: "Algebra", level: "Middle School", description: "Collecting like terms and basic expansion" },
  { name: "Expanding Single Brackets", category: "Algebra", level: "Middle School", description: "Distributive law for linear terms" },
  { name: "Expanding Double Brackets (FOIL)", category: "Algebra", level: "GCSE", description: "Multiplying two binomials" },
  { name: "Solving Linear Equations", category: "Algebra", level: "Middle School", description: "Step-by-step isolation of variables", exams: ["SAT Math", "13+ / Scholarship Track"] },
  { name: "Linear Simultaneous Equations", category: "Algebra", level: "GCSE", description: "Elimination and substitution methods", exams: ["SAT Math", "GCSE Maths Higher"] },
  { name: "Rearranging Formulas (Subject of)", category: "Algebra", level: "GCSE", description: "Changing the subject of a given formula" },
  { name: "Linear Inequalities (Solving)", category: "Algebra", level: "GCSE", description: "Solving and graphing 1D inequalities" },
  { name: "Quadratic Graphs (Drawing)", category: "Algebra", level: "GCSE", description: "Plotting parabolas and identifying features" },
  { name: "Factoring Quadratics (a=1)", category: "Algebra", level: "GCSE", description: "Factoring trinomials like x^2 + 5x + 6" },
  { name: "Difference of Two Squares", category: "Algebra", level: "GCSE", description: "Factoring x^2 - y^2 patterns" },
  { name: "Factoring Quadratics (a>1)", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Advanced factoring using split-middle-term" },
  { name: "Solving Quadratics by Factoring", category: "Algebra", level: "GCSE", description: "Finding roots using the zero product property" },
  { name: "The Quadratic Formula", category: "Algebra", level: "High School", description: "Solving roots when integers don't work" },
  { name: "Completing the Square", category: "Algebra", level: "High School", description: "Converting to vertex form: (x-h)^2 + k", exams: ["AQA GCSE Further Maths", "SAT Math"] },
  { name: "Algebraic Fractions: Addition", category: "Algebra", level: "A-Level", description: "Finding common algebraic denominators" },
  { name: "Algebraic Long Division", category: "Algebra", level: "A-Level", description: "Dividing polynomials of higher degrees" },
  { name: "The Factor Theorem", category: "Algebra", level: "A-Level", description: "Using division to find roots and factors" },
  { name: "The Remainder Theorem", category: "Algebra", level: "A-Level", description: "Determining remainders without full division" },
  { name: "Binomial Expansion (Positive n)", category: "Algebra", level: ["High School", "AQA GCSE Further Maths"], description: "Expanding (a+b)^n for whole numbers" },
  { name: "Binomial Expansion (Negative/Fractional n)", category: "Algebra", level: "A-Level", description: "Infinite series expansions" },
  { name: "Partial Fractions: Distinct Roots", category: "Algebra", level: "A-Level", description: "Splitting fractions with different linear factors" },
  { name: "Partial Fractions: Repeated Roots", category: "Algebra", level: "A-Level", description: "Splitting fractions with squaring factors" },
  { name: "Laws of Logarithms", category: "Algebra", level: ["High School", "AQA GCSE Further Maths"], description: "Log addition, subtraction, and power rules" },
  { name: "Change of Base (Logs)", category: "Algebra", level: ["A-Level", "AQA GCSE Further Maths"], description: "Switching between log bases for solving" },
  { name: "Natural Logarithms (ln x)", category: "Algebra", level: "A-Level", description: "Solving equations involving e^x" },
  { name: "The Discriminant (b^2 - 4ac)", category: "Algebra", level: "A-Level", description: "Predicting the number of real roots" },
  { name: "Solving Cubic Equations", category: "Algebra", level: ["Advanced", "AQA GCSE Further Maths"], description: "Methods for finding roots of grade 3 polynomials", exams: ["AQA GCSE Further Maths", "A-Level Further"] },
  { name: "Function Notation", category: "Algebra", level: ["GCSE", "AQA GCSE Further Maths"], description: "Understanding f(x) and evaluating functions", exams: ["AQA GCSE Further Maths", "SAT Math"] },
  { name: "Composite Functions", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Applying one function to the result of another", exams: ["AQA GCSE Further Maths"] },
  { name: "Inverse Functions", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Finding the function that reverses another", exams: ["AQA GCSE Further Maths"] },
  { name: "Domains and Ranges", category: "Algebra", level: ["High School", "AQA GCSE Further Maths"], description: "Identifying valid inputs and possible outputs", exams: ["AQA GCSE Further Maths", "AP Calculus AB"] },
  { name: "Expanding 3 Brackets", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Multiplying three binomial expressions", exams: ["AQA GCSE Further Maths"] },
  { name: "Expanding Brackets (Pascal's)", category: "Algebra", level: ["AQA GCSE Further Maths"], description: "Using Pascal's triangle for binomial expansion", exams: ["AQA GCSE Further Maths"] },
  { name: "Algebraic Fractions (Equations)", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Solving equations involving algebraic fractions", exams: ["AQA GCSE Further Maths"] },
  { name: "Factorising Cubics", category: "Algebra", level: ["A-Level", "AQA GCSE Further Maths"], description: "Breaking down cubic polynomials into factors", exams: ["AQA GCSE Further Maths", "A-Level Further"] },
  { name: "Completing the Square (ax^2)", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Completing the square when the x^2 coefficient is not 1", exams: ["AQA GCSE Further Maths"] },
  { name: "Simultaneous Equations (3 Unknowns)", category: "Algebra", level: ["A-Level", "AQA GCSE Further Maths"], description: "Solving systems with three variables", exams: ["AQA GCSE Further Maths", "A-Level Further"] },
  { name: "Quadratic Inequalities", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Solving and graphing inequalities with quadratic terms", exams: ["AQA GCSE Further Maths"] },
  { name: "Equations with Indices/Roots", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Solving complex equations involving powers and radicals", exams: ["AQA GCSE Further Maths"] },
  { name: "Limiting Values of Sequences", category: "Algebra", level: ["AQA GCSE Further Maths"], description: "Finding what a sequence approaches as n becomes large", exams: ["AQA GCSE Further Maths"] },
  { name: "Linear Sequences (nth Term)", category: "Algebra", level: ["Middle School", "AQA GCSE Further Maths"], description: "Finding the general rule for arithmetic progressions", exams: ["AQA GCSE Further Maths"] },
  { name: "Quadratic Sequences (nth Term)", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Finding the nth term rule for sequences with constant second differences", exams: ["AQA GCSE Further Maths"] },
  { name: "Exponential Graphs", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Sketching y=a^x curves", exams: ["AQA GCSE Further Maths"] },
  { name: "Sketching Quadratics", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Plotting parabolas using roots, intercept and vertex", exams: ["AQA GCSE Further Maths"] },
  { name: "Laws of Indices (Advanced)", category: "Algebra", level: ["GCSE", "AQA GCSE Further Maths"], description: "Handling products, quotients and powers of variables", exams: ["AQA GCSE Further Maths"] },
  { name: "Fractional and Negative Indices", category: "Algebra", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Working with roots and reciprocals in index form", exams: ["AQA GCSE Further Maths"] },
  { name: "Introduction to Group Theory", category: "Algebra", level: "University", description: "Basic axioms and Cayley tables" },
  { name: "Isomorphisms and Homomorphisms", category: "Algebra", level: "University", description: "Mappings between algebraic structures" },

  // --- CALCULUS (Levels: A-Level to Uni) ---
  { name: "Introduction to Limits", category: "Calculus", level: "High School", description: "Approaching values from left and right" },
  { name: "Differentiation: Power Rule", category: "Calculus", level: "High School", description: "Finding the gradient of x^n" },
  { name: "Differentiating Trig Functions", category: "Calculus", level: "A-Level", description: "Derivatives of sin, cos, and tan" },
  { name: "The Chain Rule", category: "Calculus", level: "A-Level", description: "Differentiating composite functions", exams: ["AP Calculus AB", "AQA GCSE Further Maths"] },
  { name: "The Product Rule", category: "Calculus", level: "A-Level", description: "Differentiation of u(x)v(x)", exams: ["AP Calculus AB", "AQA GCSE Further Maths"] },
  { name: "The Quotient Rule", category: "Calculus", level: "A-Level", description: "Differentiation of fractions u/v", exams: ["AP Calculus AB"] },
  { name: "Implicit Differentiation", category: "Calculus", level: "A-Level", description: "Equations where y is not isolated" },
  { name: "Parametric Differentiation", category: "Calculus", level: "A-Level", description: "Working with t as a separate parameter" },
  { name: "Second Derivatives and Convexity", category: "Calculus", level: "A-Level", description: "Finding points of inflection" },
  { name: "Stationary Points (Max/Min)", category: "Calculus", level: ["High School", "AQA GCSE Further Maths"], description: "Optimization using derivatives", exams: ["AQA GCSE Further Maths", "AP Calculus AB"] },
  { name: "Differentiation after Rearranging", category: "Calculus", level: ["AQA GCSE Further Maths", "A-Level"], description: "Differentiating terms like 1/x and sqrt(x)", exams: ["AQA GCSE Further Maths"] },
  { name: "Gradient of a Curve", category: "Calculus", level: ["AQA GCSE Further Maths", "High School"], description: "Evaluating dy/dx at a specific point", exams: ["AQA GCSE Further Maths"] },
  { name: "Equation of a Tangent", category: "Calculus", level: ["AQA GCSE Further Maths", "A-Level"], description: "Finding y-y1 = m(x-x1) for a curve", exams: ["AQA GCSE Further Maths"] },
  { name: "Equation of a Normal", category: "Calculus", level: ["AQA GCSE Further Maths", "A-Level"], description: "Finding the line perpendicular to the tangent", exams: ["AQA GCSE Further Maths"] },
  { name: "Increasing and Decreasing Functions", category: "Calculus", level: ["AQA GCSE Further Maths", "A-Level"], description: "Solving inequalities for dy/dx > 0", exams: ["AQA GCSE Further Maths"] },
  { name: "Application of Differentiation (Optimization)", category: "Calculus", level: ["AQA GCSE Further Maths", "A-Level"], description: "Solving real-world max/min problems", exams: ["AQA GCSE Further Maths"] },
  { name: "Differentiation from First Principles", category: "Calculus", level: "A-Level", description: "Proving derivatives using limits" },
  { name: "Integration: Fundamentals", category: "Calculus", level: ["High School", "AQA GCSE Further Maths"], description: "Anti-derivatives and constants of integration", exams: ["AQA GCSE Further Maths", "AP Calculus AB"] },
  { name: "Definite Integrals (Area Under Curve)", category: "Calculus", level: ["High School", "AQA GCSE Further Maths"], description: "Evaluating area between boundaries", exams: ["AQA GCSE Further Maths", "AP Calculus AB"] },
  { name: "Integration by Substitution", category: "Calculus", level: "A-Level", description: "Reverse chain rule using u-variable" },
  { name: "Integration by Parts", category: "Calculus", level: "A-Level", description: "Integrating products of functions" },
  { name: "Integration by Partial Fractions", category: "Calculus", level: "A-Level", description: "Using algebraic splits for easy integration" },
  { name: "Volume of Revolution", category: "Calculus", level: "A-Level", description: "3D volumes created by rotating functions" },
  { name: "The Trapezium Rule", category: "Calculus", level: "A-Level", description: "Numerical integration approximations" },
  { name: "Newton-Raphson Method", category: "Calculus", level: "A-Level", description: "Iteration for finding numeric roots" },
  { name: "First Order ODEs (Separable)", category: "Calculus", level: "University", description: "Solving diff equations by separating variables" },
  { name: "Integrating Factor Method", category: "Calculus", level: "University", description: "Solving linear first order ODEs", exams: ["University STEM Foundation"] },
  { name: "Second Order ODEs (Homogeneous)", category: "Calculus", level: "University", description: "Auxiliary equations and complex roots" },
  { name: "Partial Differentiation", category: "Calculus", level: "University", description: "Multivariable gradients and planes" },
  { name: "Double and Triple Integrals", category: "Calculus", level: "University", description: "Calculating volumes and masses in 3D" },
  { name: "Vector Calculus: Div, Grad, Curl", category: "Calculus", level: "University", description: "Field derivatives and basic operations" },
  { name: "Maclaurin and Taylor Series", category: "Calculus", level: "University", description: "Polynomial approximations of functions" },
  { name: "Laplace Transforms", category: "Calculus", level: "Engineering", description: "Converting ODEs to algebraic problems" },
  { name: "Fourier Series", category: "Calculus", level: "Engineering", description: "Representing waves as sums of sines and cosines" },

  // --- GEOMETRY & TRIGONOMETRY ---
  { name: "Angles on a Line and Point", category: "Geometry", level: "Primary", description: "Basic sums: 180 and 360" },
  { name: "Interior Angles of Polygons", category: "Geometry", level: "Middle School", description: "Using (n-2)*180 for sum of angles" },
  { name: "Parallel Line Angle Rules", category: "Geometry", level: "Middle School", description: "Z, F, and C angle theorems" },
  { name: "Area of 2D Shapes", category: "Geometry", level: "Primary", description: "Triangles, rectangles, and parallelograms" },
  { name: "Area of Trapezia", category: "Geometry", level: "Middle School", description: "Using the formula (a+b)/2 * h" },
  { name: "Circle Area and Circumference", category: "Geometry", level: "Middle School", description: "Calculations with Pi and radius" },
  { name: "Sector Area and Arc Length", category: "Geometry", level: "GCSE Higher", description: "Portions of circles in degrees or radians" },
  { name: "Pythagoras' Theorem (2D)", category: "Geometry", level: "Middle School", description: "Relationship between sides in right triangles" },
  { name: "Pythagoras' Theorem (3D)", category: "Geometry", level: "GCSE Higher", description: "Finding diagonals in prisms and pyramids", exams: ["AQA GCSE Further Maths"] },
  { name: "Right-Angled Trig (SOH CAH TOA)", category: "Trigonometry", level: "GCSE", description: "Calculating missing sides and angles", exams: ["AQA GCSE Further Maths", "SAT Math"] },
  { name: "Sine Rule (Sides and Angles)", category: "Trigonometry", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Law of Sines for non-right triangles", exams: ["AQA GCSE Further Maths"] },
  { name: "Cosine Rule (Sides and Angles)", category: "Trigonometry", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Law of Cosines for any triangle", exams: ["AQA GCSE Further Maths"] },
  { name: "Area of a Triangle (1/2 ab sin C)", category: "Trigonometry", level: "GCSE Higher", description: "Finding area using two sides and angle" },
  { name: "Circle Theorems: Angle at Center", category: "Geometry", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Centre vs circumference theorems", exams: ["AQA GCSE Further Maths"] },
  { name: "Circle Theorems: Cyclic Quadrilaterals", category: "Geometry", level: "GCSE Higher", description: "Opposite angles summing to 180" },
  { name: "Circle Theorems: Alternate Segment", category: "Geometry", level: "GCSE Higher", description: "Tangents and chords relationships" },
  { name: "3D Coordinates", category: "Geometry", level: "High School", description: "Working with (x, y, z) axes" },
  { name: "Equation of a Circle (x-a)^2 + (y-b)^2", category: "Coordinate Geometry", level: "High School", description: "Centers and radii on graphs" },
  { name: "Radians (Conversion and Uses)", category: "Trigonometry", level: "A-Level", description: "Moving beyond degrees" },
  { name: "Small Angle Approximations", category: "Trigonometry", level: "A-Level", description: "Simplifying trig when theta is near 0" },
  { name: "Double Angle Formulae", category: "Trigonometry", level: "A-Level", description: "Sin(2x) and Cos(2x) expansions" },
  { name: "Trigonometric Identities (Pythagorean)", category: "Trigonometry", level: "A-Level", description: "Proving expressions using sin^2 + cos^2 = 1" },
  { name: "Vector Geometry in 3D", category: ["Vectors", "Geometry"], level: "A-Level", description: "Lines and planes in vector space" },
  { name: "Dot Product and Scalar Product", category: "Vectors", level: "University", description: "Finding angles between vector lines" },
  { name: "Coordinate Geometry: Distance", category: "Coordinate Geometry", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Using Pythagoras to find the length between two points", exams: ["AQA GCSE Further Maths"] },
  { name: "Matrix Transformations: Combined", category: "Matrices", level: ["AQA GCSE Further Maths"], description: "Multiplying transformation matrices to find a single resulting matrix", exams: ["AQA GCSE Further Maths"] },
  { name: "Coordinate Geometry: Parallel Lines", category: "Coordinate Geometry", level: ["GCSE", "AQA GCSE Further Maths"], description: "Working with lines of equal gradient", exams: ["AQA GCSE Further Maths", "SAT Math"] },
  { name: "Coordinate Geometry: Perpendicular Lines", category: "Coordinate Geometry", level: ["GCSE", "AQA GCSE Further Maths"], description: "Working with lines at 90 degrees", exams: ["AQA GCSE Further Maths"] },
  { name: "Coordinate Geometry: Midpoints", category: "Coordinate Geometry", level: ["Middle School", "AQA GCSE Further Maths"], description: "Finding the center of a line segment", exams: ["AQA GCSE Further Maths", "SAT Math"] },
  { name: "Coordinate Geometry: Ratios", category: "Coordinate Geometry", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Dividing line segments in given ratios", exams: ["AQA GCSE Further Maths"] },
  { name: "Equation of a Line (y=mx+c)", category: "Coordinate Geometry", level: ["GCSE", "AQA GCSE Further Maths"], description: "Constructing and interpreting linear graphs", exams: ["AQA GCSE Further Maths", "SAT Math"] },
  { name: "Equation of a Circle (Origin)", category: "Coordinate Geometry", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Working with x^2 + y^2 = r^2", exams: ["AQA GCSE Further Maths"] },
  { name: "Equation of a Circle (General)", category: "Coordinate Geometry", level: ["A-Level", "AQA GCSE Further Maths"], description: "Working with (x-a)^2 + (y-b)^2 = r^2", exams: ["AQA GCSE Further Maths", "A-Level Further"] },
  { name: "Equation of a Tangent to a Circle", category: "Coordinate Geometry", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Finding equations of lines touching circles", exams: ["AQA GCSE Further Maths"] },
  { name: "Differentiation: Second Derivatives", category: "Calculus", level: ["A-Level", "AQA GCSE Further Maths"], description: "Finding acceleration and classifying turning points", exams: ["AQA GCSE Further Maths", "AP Calculus AB"] },
  { name: "Matrices: Scalar Multiplication", category: "Matrices", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Multiplying a matrix by a single number", exams: ["AQA GCSE Further Maths"] },
  { name: "Matrices: Multiplication (2x2 by 2x1)", category: "Matrices", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Applying transformations to vectors", exams: ["AQA GCSE Further Maths"] },
  { name: "Matrices: Identity Matrix", category: "Matrices", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Understanding the matrix equivalent of '1'", exams: ["AQA GCSE Further Maths"] },
  { name: "Matrices: Unit Square Transformations", category: "Matrices", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Mapping (1,0) and (0,1) for visual transformations", exams: ["AQA GCSE Further Maths"] },
  { name: "Geometry: Geometric Proof", category: "Geometry", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Constructing rigorous arguments for shape properties", exams: ["AQA GCSE Further Maths"] },
  { name: "Trigonometry: Exact Values", category: "Trigonometry", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Using non-calculator values for sin, cos, tan (30, 45, 60)", exams: ["AQA GCSE Further Maths"] },
  { name: "Trigonometry: Graphs", category: "Trigonometry", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Sketching and interpreting sin, cos, tan curves", exams: ["AQA GCSE Further Maths"] },
  { name: "Trigonometry: Solving Equations", category: "Trigonometry", level: ["A-Level", "AQA GCSE Further Maths"], description: "Finding principal and secondary solutions in a range", exams: ["AQA GCSE Further Maths", "A-Level Further"] },

  // --- STATISTICS & PROBABILITY ---
  { name: "Mean, Median, and Mode", category: ["Statistics", "AQA GCSE Further Maths"], level: "Primary", description: "Basic central tendencies" },
  { name: "Range and Interquartile Range", category: "Statistics", level: "Middle School", description: "Measures of spread" },
  { name: "Box and Whisker Plots", category: "Statistics", level: "GCSE", description: "Visualizing five-number summaries" },
  { name: "Scatter Graphs and Correlation", category: "Statistics", level: "Middle School", description: "Trend lines and relationship types" },
  { name: "Probability Trees (Independent)", category: ["Probability", "Statistics"], level: ["GCSE", "AQA GCSE Further Maths"], description: "Successive events with fixed odds" },
  { name: "Conditional Probability (Dependent)", category: ["Probability", "Statistics"], level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Odds that change based on previous outcomes" },
  { name: "Venn Diagrams for Probability", category: "Probability", level: "GCSE Higher", description: "Union, intersection, and complement" },
  { name: "Cumulative Frequency Curves", category: "Statistics", level: "GCSE Higher", description: "Estimating medians from curves" },
  { name: "Histograms (Frequency Density)", category: "Statistics", level: "GCSE Higher", description: "Continuous data with unequal width bars" },
  { name: "Factorials (n!)", category: ["Combinatorics", "Probability"], level: "High School", description: "Basic counting principles and multiplication" },
  { name: "Permutations (nPr)", category: "Combinatorics", level: "High School", description: "Ordered arrangements" },
  { name: "Combinations (nCr)", category: "Combinatorics", level: "High School", description: "Unordered selections" },
  { name: "The Binomial Distribution", category: "Statistics", level: "A-Level", description: "Discrete success/failure modeling" },
  { name: "The Normal Distribution (Bell Curve)", category: "Statistics", level: "A-Level", description: "Standard deviation and Z-scores" },
  { name: "Hypothesis Testing: Binomial", category: "Statistics", level: "A-Level", description: "One-tail and two-tail significance tests" },
  { name: "Hypothesis Testing: Mean (Normal)", category: "Statistics", level: "A-Level", description: "Testing if a population mean has changed" },
  { name: "Poisson Distribution", category: "Statistics", level: "University", description: "Modeling rate of events over time" },
  { name: "Central Limit Theorem", category: "Statistics", level: "University", description: "Why and how distributions become normal" },
  { name: "Correlation Coefficients (Pearson/Spearman)", category: "Statistics", level: "University", description: "Numerical measures of relationship strength" },
  { name: "Chi-Squared Independence Testing", category: "Statistics", level: "University", description: "Testing categorical associations" },

  // --- NUMBER THEORY & DISCRETE MATH ---
  { name: "Prime Numbers and Sieve of Eratosthenes", category: "Number Theory", level: "Middle School", description: "Finding primes and divisibility rules" },
  { name: "Modulo Arithmetic (Clock Math)", category: "Number Theory", level: "High School", description: "Working with remainders in loops" },
  { name: "Euclidean Algorithm (GCD)", category: "Number Theory", level: "University", description: "Step-by-step method for finding Greatest Common Divisor" },
  { name: "Fermat's Little Theorem", category: "Number Theory", level: "University", description: "Powers of primes in modular math" },
  { name: "Chinese Remainder Theorem", category: "Number Theory", level: "University", description: "Solving systems of congruences" },
  { name: "Graphs: Nodes and Edges", category: "Graph Theory", level: "Discrete", description: "Terminology and basic drawing" },
  { name: "Dijkstra's Shortest Path", category: "Graph Theory", level: "Discrete", description: "Finding the fastest route between points" },
  { name: "Euler and Hamiltonian Paths", category: "Graph Theory", level: "Discrete", description: "Visiting every edge vs visiting every node" },
  { name: "Truth Tables (AND, OR, NOT)", category: "Logic", level: "Discrete", description: "Evaluating logical expressions" },
  { name: "Boolean Algebra Simplification", category: "Logic", level: "Discrete", description: "Reducing complex logic circuits" },
  { name: "Mathematical Induction Proofs", category: "Logic", level: "A-Level / Uni", description: "Recursive proofs for all integers n" },

  // --- MATRICES & LINEAR ALGEBRA ---
  { name: "Intro to Matrices (Addition/Subtraction)", category: ["Matrices", "Algebra"], level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Basic matrix size and operations", exams: ["AQA GCSE Further Maths"] },
  { name: "Matrix Multiplication (2x2)", category: ["Matrices", "Computing"], level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Dot products of rows and columns", exams: ["AQA GCSE Further Maths"] },
  { name: "Determinant of 2x2 and 3x3 Matrices", category: "Matrices", level: "A-Level", description: "Calculating the 'volume' factor" },
  { name: "Inverse of 2x2 Matrices", category: "Matrices", level: "A-Level", description: "Solving AX=B problems" },
  { name: "2D Transformations (Rotation/Reflections)", category: "Matrices", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Using matrices to warp shapes", exams: ["AQA GCSE Further Maths"] },
  { name: "Gaussian Elimination", category: "Linear Algebra", level: "University", description: "Solving large systems of equations" },
  { name: "Eigenvalues and Eigenvectors", category: "Linear Algebra", level: "University", description: "Finding characteristic vectors" },
  { name: "Vector Spaces and Bases", category: "Linear Algebra", level: "University", description: "Dimension and spanning sets" },

  // --- COMPLEX NUMBERS ---
  { name: "Intro to i (Imaginary Numbers)", category: "Complex Numbers", level: "High School", description: "Square roots of negatives" },
  { name: "Argand Diagrams", category: "Complex Numbers", level: "High School", description: "Plotting complex numbers as vectors" },
  { name: "Complex Conjugates", category: "Complex Numbers", level: "High School", description: "Division of complex fractions" },
  { name: "Modulus and Argument Form", category: "Complex Numbers", level: "A-Level", description: "Polar representation of complex numbers" },
  { name: "De Moivre's Theorem", category: "Complex Numbers", level: "University", description: "Powers and roots of complex vectors" },
  { name: "Euler's Identity (e^ix)", category: "Complex Numbers", level: "University", description: "The most beautiful equation in math" },

  // --- SPECIALIZED & APPLIED ---
  { name: "Compound Interest and Depreciation", category: "Finance", level: "Middle School", description: "Growth and decay of money" },
  { name: "Annuities and Perpetuities", category: "Finance", level: "University", description: "Infinite series of payments" },
  { name: "Black-Scholes Model (Concept)", category: "Finance", level: "Advanced", description: "Pricing derivatives (Overview)" },
  { name: "Projectile Motion (Parabolas)", category: "Physics Math", level: "A-Level", description: "Gravity and vectors in motion" },
  { name: "Hooke's Law (Springs)", category: "Physics Math", level: "High School", description: "Linear elasticity math" },
  { name: "Relativity (Time Dilation)", category: "Theoretical", level: "Advanced", description: "Lorentz transforms and logic" },
  { name: "Quantum Mechanics: Wavefunctions", category: "Theoretical", level: "Advanced", description: "Probabilities in the subatomic world" },
  { name: "Game Theory: Nash Equilibrium", category: "Logic", level: "University", description: "Strategic decision making" },
  { name: "Cryptosystems (RSA Algorithm)", category: "Computing", level: "University", description: "Math behind digital security" },
  { name: "Fractals and Iteration", category: "Geometry", level: "Advanced", description: "Mandelbrot and Sierpinski patterns" },
  { name: "Chaos Theory (Butterfly Effect)", category: "Analysis", level: "Advanced", description: "Sensitivity to initial conditions" },
  { name: "Topology (Mobius Strips)", category: "Geometry", level: "University", description: "Surfaces with one side" },

  // --- ADDITIONAL EXTENSIVE EXPANSION ---
  // --- FURTHER ALGEBRA ---
  { name: "Cramer's Rule", category: "Algebra", level: "A-Level", description: "Solving systems using determinants" },
  { name: "Synthetic Division", category: "Algebra", level: "High School", description: "Shortcut for polynomial division" },
  { name: "Descartes' Rule of Signs", category: "Algebra", level: "University", description: "Predicting positive and negative roots" },
  { name: "Vieta's Formulas", category: "Algebra", level: "A-Level / Uni", description: "Relationships between roots and coefficients" },
  { name: "Symmetric Polynomials", category: "Algebra", level: "University", description: "Polynomials invariant under variable swaps" },
  { name: "Galois Theory Basics", category: "Algebra", level: "University", description: "Connecting field theory and group theory" },
  { name: "Ring Theory: Ideals", category: "Algebra", level: "University", description: "Substructures of algebraic rings" },

  // --- FURTHER CALCULUS ---
  { name: "L'Hôpital's Rule", category: "Calculus", level: "A-Level", description: "Solving indeterminate limits like 0/0" },
  { name: "Gradient Vector Fields", category: "Calculus", level: "University", description: "Visualizing scalar field slopes" },
  { name: "Divergence Theorem", category: "Calculus", level: "University", description: "Relating surface and volume integrals" },
  { name: "Stokes' Theorem", category: "Calculus", level: "University", description: "Relating line and surface integrals" },
  { name: "Green's Theorem", category: "Calculus", level: "University", description: "Special case of Stokes' in 2D" },
  { name: "Variational Calculus", category: "Calculus", level: "Advanced", description: "Finding functions that minimize integrals" },
  { name: "Riemann Sums", category: "Calculus", level: "A-Level", description: "Formal definition of the integral" },
  
  // --- FURTHER GEOMETRY ---
  { name: "Non-Euclidean Geometry", category: "Geometry", level: "University", description: "Hyperbolic and Elliptic space" },
  { name: "Spherical Trigonometry", category: "Geometry", level: "Advanced", description: "Triangles on a sphere (navigation)" },
  { name: "Projective Geometry", category: "Geometry", level: "University", description: "Lines meeting at infinity" },
  { name: "Affine Transformations", category: "Geometry", level: "University", description: "Mappings preserving collinearity" },
  { name: "Stereographic Projection", category: "Geometry", level: "Advanced", description: "Mapping spheres to planes" },

  // --- FURTHER NUMBER THEORY ---
  { name: "Goldbach's Conjecture", category: "Number Theory", level: "History", description: "The sum of primes problem" },
  { name: "Riemann Hypothesis (Overview)", category: "Number Theory", level: "History", description: "Primes and the Zeta function" },
  { name: "Diophantine Equations", category: "Number Theory", level: "University", description: "Integer solution problems" },
  { name: "Modular Inverse", category: "Number Theory", level: "University", description: "Finding reciprocals in limited sets" },
  { name: "Power Residues", category: "Number Theory", level: "University", description: "Properties of modular squares" },

  // --- APPLIED & ENGINEERING ---
  { name: "Control Theory: Feedback Loops", category: "Engineering", level: "University", description: "Math of stable systems" },
  { name: "Signal Processing: Sampling", category: "Engineering", level: "University", description: "Converting waves to data" },
  { name: "Stochastic Processes", category: "Statistics", level: "University", description: "Random variables in time" },
  { name: "Markov Chains", category: "Statistics", level: "University", description: "Transition probability matrices" },
  { name: "Queueing Theory", category: "Statistics", level: "Advanced", description: "Modeling waiting lines" },
  { name: "Fluid Dynamics: Bernoulli", category: "Physics Math", level: "University", description: "Conservation of energy in flows" },
  { name: "Maxwell's Equations (Math)", category: "Physics Math", level: "University", description: "Vector calculus of EM fields" },

  // --- LOGIC & SETS ---
  { name: "Russell's Paradox", category: "Logic", level: "History", description: "The set of all sets problem" },
  { name: "Godel's Incompleteness", category: "Logic", level: "History", description: "Limits of formal systems" },
  { name: "Zermelo-Fraenkel Axioms", category: "Set Theory", level: "University", description: "Foundations of modern sets" },
  { name: "Cardinality of Infinite Sets", category: "Set Theory", level: "University", description: "Aleph-null and beyond" },
  { name: "Fuzzy Logic", category: "Logic", level: "University", description: "Math with degrees of truth" },

  // --- HISTORY & CULTURE ---
  { name: "Ancient Egyptian Fractions", category: "History", level: "History", description: "Unit fraction sums" },
  { name: "Babylonian Base-60", category: "History", level: "History", description: "Origins of 360 degrees" },
  { name: "The Invention of Zero", category: "History", level: "History", description: "Indian contribution to math" },
  { name: "Leibniz vs Newton", category: "History", level: "History", description: "The calculus controversy" },
  { name: "Women in Math: Ada Lovelace", category: "History", level: "History", description: "Origins of programming math" },

  // --- FURTHER EXPANSION ---
  // --- DATA STRUCTURES & ALGORITHMS ---
  { name: "Big O Notation", category: "Computing", level: "University", description: "Analyzing time and space complexity" },
  { name: "Binary Search Trees", category: "Computing", level: "University", description: "Ordering and searching efficiency" },
  { name: "AVL and Red-Black Trees", category: "Computing", level: "Advanced", description: "Self-balancing tree algorithms" },
  { name: "Hash Tables & Collisions", category: "Computing", level: "University", description: "O(1) data retrieval methods" },
  { name: "Dynamic Programming: Knapsack", category: "Computing", level: "University", description: "Optimization through subproblems" },
  { name: "P vs NP Problem", category: "Computing", level: "Advanced", description: "The biggest mystery in CS" },
  { name: "Heaps and Priority Queues", category: "Computing", level: "University", description: "Efficiently finding max/min elements" },
  { name: "Sorting: Quicksort & Mergesort", category: "Computing", level: "University", description: "Divide and conquer algorithms" },

  // --- DISCRETE STRUCTURES ---
  { name: "Combinatorial Proofs", category: "Discrete Math", level: "University", description: "Proving identities by counting subsets" },
  { name: "Pigeonhole Principle", category: "Discrete Math", level: "High School", description: "Basic counting with constraints" },
  { name: "Inclusion-Exclusion Principle", category: "Discrete Math", level: "University", description: "Correcting overcounts in sets" },
  { name: "Generating Functions", category: "Discrete Math", level: "Advanced", description: "Using power series to count" },
  { name: "Recurrence Relations", category: "Discrete Math", level: "University", description: "Solving sequences defined by predecessors" },
  { name: "Planar Graphs & Euler's Formula", category: "Graph Theory", level: "University", description: "V - E + F = 2 on flat surfaces" },
  { name: "Graph Coloring (4-Color Map)", category: "Graph Theory", level: "University", description: "Minimum colors for adjacent nodes" },

  // --- ABSTRACT ALGEBRA ---
  { name: "Group Homomorphisms", category: "Algebra", level: "University", description: "Structure-preserving mappings" },
  { name: "Normal Subgroups & Quotients", category: "Algebra", level: "University", description: "Building new groups from old ones" },
  { name: "Sylow Theorems", category: "Algebra", level: "Advanced", description: "Analyzing p-subgroup structures" },
  { name: "Rings, Integral Domains, Fields", category: "Algebra", level: "University", description: "Hierarchy of algebraic structures" },
  { name: "Vector Space Basis & Dimension", category: "Linear Algebra", level: "University", description: "Fundamental spans of spaces" },
  { name: "Inner Product Spaces", category: "Linear Algebra", level: "University", description: "Generalizing dot products" },
  { name: "Jordan Normal Form", category: "Linear Algebra", level: "Advanced", description: "Decomposing non-diagonalizable matrices" },

  // --- REAL & COMPLEX ANALYSIS ---
  { name: "Epsilon-Delta Continuity", category: "Analysis", level: "University", description: "Formal definition of a limit" },
  { name: "Uniform Convergence", category: "Analysis", level: "University", description: "Sequences and series of functions" },
  { name: "The Bounded Monotone Theorem", category: "Analysis", level: "University", description: "Convergence of sequences" },
  { name: "Cauchy-Riemann Equations", category: "Analysis", level: "University", description: "Conditions for complex differentiability" },
  { name: "Residue Theorem", category: "Analysis", level: "Advanced", description: "Integrating around complex singularities" },
  { name: "Contour Integration", category: "Analysis", level: "University", description: "Solving real integrals using complex paths" },
  { name: "Metric Spaces", category: "Analysis", level: "University", description: "Generalizing distance in any space" },

  // --- TOPOLOGY ---
  { name: "Point-Set Topology", category: "Topology", level: "University", description: "Open and closed sets in abstract space" },
  { name: "Compactness and Connectedness", category: "Topology", level: "University", description: "Core properties of topological spaces" },
  { name: "Homotopy and Fundamental Group", category: "Topology", level: "Advanced", description: "Equivalence of paths and loops" },
  { name: "Simplicial Complexes", category: "Topology", level: "Advanced", description: "Building spaces from triangles" },
  { name: "The Hairy Ball Theorem", category: "Topology", level: "Advanced", description: "Vector fields on spheres" },

  // --- PROBABILITY & STATISTICS ---
  { name: "Bayes' Theorem Applications", category: "Probability", level: "University", description: "Updating beliefs with new evidence" },
  { name: "Law of Large Numbers", category: "Statistics", level: "University", description: "Why averages stabilize" },
  { name: "The Poisson Process", category: "Probability", level: "University", description: "Modeling random arrival times" },
  { name: "Maximum Likelihood Estimation", category: "Statistics", level: "University", description: "Finding the best fit for parameters" },
  { name: "ANOVA (Analysis of Variance)", category: "Statistics", level: "University", description: "Comparing means across many groups" },
  { name: "Multiple Linear Regression", category: "Statistics", level: "University", description: "Modeling with multiple predictors" },
  { name: "Non-Parametric Tests", category: "Statistics", level: "Advanced", description: "Tests without normal assumptions" },

  // --- OPTIMIZATION & NUMERICAL ---
  { name: "Linear Programming: Simplex", category: "Optimization", level: "University", description: "Solving constraints in N-dimensions" },
  { name: "Gradient Descent", category: "Optimization", level: "University", description: "Step-by-step minimization" },
  { name: "Lagrange Multipliers", category: "Calculus", level: "University", description: "Optimization with equality constraints" },
  { name: "Runge-Kutta Methods", category: "Numerical", level: "Engineering", description: "Solving ODEs numerically" },
  { name: "Monte Carlo Simulations", category: "Numerical", level: "Advanced", description: "Solving problems using randomness" },

  // --- APPLIED MATH & PHYSICS ---
  { name: "Wave Equation", category: "Physics Math", level: "University", description: "Second order PDE for vibration" },
  { name: "Heat Equation", category: "Physics Math", level: "University", description: "Modeling thermal diffusion" },
  { name: "Schrodinger's Equation (Math)", category: "Quantum", level: "University", description: "The foundation of quantum probability" },
  { name: "Maxwell's Equations", category: "Physics Math", level: "University", description: "Unified theory of electromagnetism" },
  { name: "Information Theory: Entropy", category: "Computing", level: "University", description: "The math of uncertainty and compression" },
  { name: "Error Correcting Codes", category: "Computing", level: "Advanced", description: "Hamming weight and checksum logic" },

  // --- HISTORY & MISC ---
  { name: "Fermat's Last Theorem", category: "History", level: "History", description: "The 350-year-old challenge" },
  { name: "The Turing Machine", category: "Computing", level: "University", description: "The theoretical model of computation" },
  { name: "Game Theory: Prisoner's Dilemma", category: "Logic", level: "University", description: "Cooperation vs Defection math" },
  { name: "Cantor's Diagonal Argument", category: "Set Theory", level: "University", description: "Proving there are different sizes of infinity" },
  
  // --- THIRD WAVE: SPECIALIZED & INTENSE ---
  // --- ENGINEERING MATHEMATICS ---
  { name: "First Order ODEs: Exact Equations", category: "Engineering", level: "University", description: "Using partial derivatives to solve ODEs" },
  { name: "Second Order ODEs: Method of Undetermined Coefficients", category: "Engineering", level: "University", description: "Solving non-homogeneous differential equations" },
  { name: "Bessel Functions", category: "Engineering", level: "Advanced", description: "Solutions to Bessel's differential equation" },
  { name: "Legendre Polynomials", category: "Engineering", level: "Advanced", description: "Orthogonal polynomials in spherical coordinates" },
  { name: "Vector Spaces: Kernels and Images", category: "Linear Algebra", level: "University", description: "The null space and range of linear maps" },
  { name: "Orthonormal Bases & Gram-Schmidt", category: "Linear Algebra", level: "University", description: "Creating perpendicular unit vectors" },
  { name: "Heat Transfer: Fourier's Law", category: "Engineering", level: "University", description: "The partial differential equation of heat flow" },
  { name: "Fluid Mechanics: Navier-Stokes", category: "Engineering", level: "Advanced", description: "The universal equations of fluid flow" },

  // --- COMPUTER SCIENCE DEPTH ---
  { name: "Turing Completeness", category: "Computing", level: "University", description: "What makes a language 'complete'?" },
  { name: "Lambda Calculus", category: "Computing", level: "University", description: "The theoretical basis for functional programming" },
  { name: "Halting Problem Proof", category: "Computing", level: "University", description: "Why we can't always predict if code will end" },
  { name: "Finite State Automata (DFA/NFA)", category: "Computing", level: "University", description: "Modeling simple machines and regex" },
  { name: "Context-Free Grammars", category: "Computing", level: "University", description: "Defining programming language syntax" },
  { name: "Floating Point Representation (IEEE 754)", category: "Computing", level: "University", description: "Math of how computers store decimals" },
  { name: "Relational Algebra", category: "Computing", level: "University", description: "The math behind SQL and databases" },

  // --- CRYPTOGRAPHY ---
  { name: "Diffie-Hellman Key Exchange", category: "Cryptography", level: "University", description: "Math for sharing secrets over open lines" },
  { name: "Elliptic Curve Cryptography", category: "Cryptography", level: "Advanced", description: "Modern security using geometry" },
  { name: "AES Encryption Principles", category: "Cryptography", level: "University", description: "Symmetric block cipher mathematics" },
  { name: "Zero-Knowledge Proofs", category: "Cryptography", level: "Advanced", description: "Proving you know something without revealing it" },
  { name: "Blockchain & Hashing Math", category: "Cryptography", level: "University", description: "Foundations of decentralized ledgers" },

  // --- THEORETICAL PHYSICS MATH ---
  { name: "Tensors and Index Notation", category: "Physics Math", level: "Advanced", description: "Generalizing vectors to higher dimensions" },
  { name: "Lagrangian Mechanics", category: "Physics Math", level: "University", description: "Reformulating motion as energy minimization" },
  { name: "Hamiltonian Mechanics", category: "Physics Math", level: "University", description: "Equation of motion using phase space" },
  { name: "Special Relativity: Lorentz Factor", category: "Physics Math", level: "University", description: "Math of time dilation and length contraction" },
  { name: "General Relativity: Curvature", category: "Physics Math", level: "Advanced", description: "Einstein's field equations and geometry" },
  { name: "Statistical Mechanics: Partition Functions", category: "Physics Math", level: "University", description: "Connecting micro and macro states" },

  // --- ADVANCED ANALYSIS ---
  { name: "Lebesgue Integration", category: "Analysis", level: "Advanced", description: "A more robust theory of integration" },
  { name: "Hilbert Spaces", category: "Analysis", level: "Advanced", description: "Infinite dimensional inner product spaces" },
  { name: "Banach Spaces", category: "Analysis", level: "Advanced", description: "Complete normed vector spaces" },
  { name: "Functional Analysis: Linear Operators", category: "Analysis", level: "Advanced", description: "Functions that act on other functions" },
  { name: "Fixed Point Theorems (Brouwer/Banach)", category: "Analysis", level: "University", description: "Conditions for stable points in mappings" },

  // --- CATEGORY: GAME THEORY & ECONOMICS ---
  { name: "Zero-Sum Games", category: "Logic", level: "University", description: "Competitive math where one's gain is another's loss" },
  { name: "Pareto Optimality", category: "Logic", level: "University", description: "Situations where no one can improve without hurting another" },
  { name: "Cournot vs Bertrand Competition", category: "Economics", level: "University", description: "Math models of market duopoly" },
  { name: "Auction Theory", category: "Economics", level: "University", description: "Optimizing bidding strategies" },
  { name: "Option Pricing: Binomial Trees", category: "Finance", level: "University", description: "Step-by-step models for financial derivatives" },

  // --- MISC / CURIOSITIES ---
  // --- ADDED FOR COMPLETENESS ---
  { name: "Game Theory: Evolutionary Stability", category: "Analysis", level: "Advanced", description: "Biological survival strategies as math" },
  { name: "String Theory Math (Overview)", category: "Physics Math", level: "Advanced", description: "Calabi-Yau manifolds and 11 dimensions" },
  { name: "Cryptography: Public Key Infrastructure", category: "Computing", level: "University", description: "Managing trust in digital networks" },
  { name: "Set Theory: Axiom of Choice", category: "Logic", level: "University", description: "Can we always pick one item from every set?" },
  { name: "Surreal Numbers", category: "Number Theory", level: "Advanced", description: "Conway's construction of all numbers" },
  { name: "Game of Life (Cellular Automata)", category: "Computing", level: "History", description: "Emergent behavior from simple rules" },
  
  // --- SCHOOL CURRICULUM EXPANSION (Middle School to A-Level) ---
  // --- ARITHMETIC & NUMBER ---
  { name: "Product Rule for Counting", category: "Arithmetic", level: "GCSE", description: "Calculating total outcomes using multiplication" },
  { name: "Estimating Mean from Grouped Data", category: "Statistics", level: "GCSE", description: "Using midpoints to approximate averages" },
  { name: "Standard Form with Negative Indices", category: "Arithmetic", level: ["GCSE", "AQA GCSE Further Maths"], description: "Handling tiny numbers like 0.00034" },
  { name: "Venn Diagrams: Shading Sets", category: "Logic", level: "GCSE Higher", description: "Representing A ∩ B, A ∪ B', etc." },
  { name: "Set Notation Basics", category: "Logic", level: "High School", description: "Universal sets, elements, and empty sets" },
  
  // --- ALGEBRA ---
  { name: "Arithmetic Series & Sigma Notation", category: "Algebra", level: "A-Level", description: "Summing sequences with constant differences" },
  { name: "Geometric Series & Sum to Infinity", category: "Algebra", level: "A-Level", description: "Convergent sequences and growth models" },
  { name: "Proof by Contradiction", category: "Logic", level: "A-Level", description: "Assuming the opposite to find a paradox" },
  { name: "Iterative Methods (Fixed Point)", category: "Algebra", level: "A-Level", description: "Using x_n+1 formulas to find roots" },
  { name: "Graphs: Cobweb and Staircase Diagrams", category: "Algebra", level: "A-Level", description: "Visualizing convergence in iterations" },
  
  // --- GEOMETRY & VECTORS ---
  { name: "Vector Lines: Angle between Lines", category: "Vectors", level: "A-Level", description: "Using the dot product formula" },
  { name: "Vector Planes: Intersection", category: "Vectors", level: "University", description: "Finding lines where two planes meet" },
  { name: "Circle Theorems: Tangent-Radius", category: "Geometry", level: "GCSE Higher", description: "Perpendicular property at contact point" },
  
  // --- MECHANICS (A-Level / High School Physics) ---
  { name: "SUVAT: Uniform Acceleration", category: "Mechanics", level: "A-Level", description: "Equations of motion along a straight line" },
  { name: "Newton's Second Law (F = ma)", category: "Mechanics", level: "High School", description: "Force, mass, and acceleration relationships" },
  { name: "Static Equilibrium & Moments", category: "Mechanics", level: "A-Level", description: "Balancing forces and rotations" },
  { name: "Coefficient of Friction (μ)", category: "Mechanics", level: "A-Level", description: "Calculating resistive forces on surfaces" },
  { name: "Projectiles: Range and Max Height", category: "Mechanics", level: "A-Level", description: "2D motion under gravity" },
  { name: "Pulleys and Tension", category: "Mechanics", level: "A-Level", description: "Connected particles analysis" },
  
  // --- STATISTICS ---
  { name: "Sampling Methods: Stratified & Systematic", category: "Statistics", level: "GCSE", description: "Collecting unbiased data sets" },
  { name: "Stem and Leaf Diagrams", category: "Statistics", level: "Middle School", description: "Organizing raw data for analysis" },
  { name: "Probability: Combined Events", category: ["Probability", "Statistics"], level: ["GCSE", "AQA GCSE Further Maths"], description: "P(A and B) vs P(A or B)" },
  { name: "Standard Deviation calculation", category: "Statistics", level: "A-Level", description: "Mathematical measure of data spread" },
  { name: "PMCC: Product Moment Correlation Coefficient", category: "Statistics", level: "A-Level", description: "Numeric measure of linear correlation" },
  
  // --- FURTHER MATHS GCSE specific ---
  { name: "Differentiation: Stationary Points", category: "Calculus", level: ["GCSE Higher", "AQA GCSE Further Maths"], description: "Finding and classifying turning points" },
  { name: "Proof: Algebraic Proof", category: "Algebra", level: "GCSE", description: "Proving odd/even results algebraically" },

  // --- FINAL COMPREHENSIVE CURRICULUM EXPANSION ---
  // --- COMPUTER SCIENCE & ENGINEERING ---
  { name: "Operating Systems: Process Scheduling", category: "Computing", level: "University", description: "FCFS, Round Robin, and Priority math" },
  { name: "Compilers: Lexical Analysis", category: "Computing", level: "University", description: "Tokenizing code with finite automata" },
  { name: "Computer Architecture: Pipelining", category: "Computing", level: "University", description: "Math of CPU instruction throughput" },
  { name: "Digital Logic: Karnaugh Maps", category: "Computing", level: "University", description: "Simplifying boolean expressions visually" },
  { name: "Networking: Subnetting Math", category: "Computing", level: "University", description: "Calculating IP ranges and masks" },
  { name: "Database Normalization (1NF, 2NF, 3NF)", category: "Computing", level: "University", description: "Math of reducing data redundancy" },
  { name: "Artificial Intelligence: Neural Net Backprop", category: "Computing", level: "Advanced", description: "The calculus of machine learning" },
  
  // --- ADVANCED PURE MATHEMATICS ---
  { name: "Category Theory: Functors & Natural Transformations", category: "Algebra", level: "Advanced", description: "Maps between categories" },
  { name: "Algebraic Geometry: Varieties", category: "Geometry", level: "Advanced", description: "Zero sets of polynomial systems" },
  { name: "Galois Correspondence", category: "Algebra", level: "Advanced", description: "Deeper link between fields and groups" },
  { name: "Measure Theory: Sigma-Algebras", category: "Analysis", level: "Advanced", description: "Foundation for Lebesgue integration" },
  { name: "Complex Analysis: Riemann Surfaces", category: "Analysis", level: "Advanced", description: "Multi-valued complex functions" },
  { name: "Number Theory: Elliptic Curves", category: "Arithmetic", level: "Advanced", description: "Points on cubic curves over fields" },
  { name: "Topology: Knot Theory", category: "Topology", level: "Advanced", description: "Math of intertwined loops" },

  // --- APPLIED MATH & PHYSICS (EXTREME) ---
  // --- FLUIDS AND THERMO ---
  { name: "Fluid Dynamics: Reynold's Number", category: "Physics Math", level: "Engineering", description: "Predicting laminar vs turbulent flow" },
  { name: "Thermodynamics: Entropy & Enthalpy", category: "Physics Math", level: "University", description: "Mathematical laws of heat energy" },
  { name: "Quantum Mechanics: Bra-Ket Notation", category: "Quantum", level: "University", description: "Dirac notation for state vectors" },
  { name: "General Relativity: Schwarzschild Metric", category: "Physics Math", level: "Advanced", description: "Math of space-time around black holes" },
  { name: "Analytical Mechanics: Poisson Brackets", category: "Physics Math", level: "Advanced", description: "Symplectic geometry of motion" },

  // --- MORE SCHOOL / A-LEVEL CORE ---
  { name: "Trigonometry: Double Angle Identities", category: "Geometry", level: "A-Level", description: "sin(2x), cos(2x) and tan(2x) formulas" },
  { name: "Algebra: Partial Fractions", category: "Algebra", level: "A-Level", description: "Splitting complex fractions for integration" },
  { name: "Calculus: Implicit Differentiation", category: "Calculus", level: "A-Level", description: "Differentiating equations like x² + y² = 25" },
  { name: "Parametric Equations: Motion", category: "Calculus", level: "A-Level", description: "Defining curves with a hidden variable t" },
  { name: "Probability: Normal Distribution", category: "Statistics", level: "A-Level", description: "The bell curve and Z-scores" },
  
  // --- LOGIC & SETS DEPTH ---
  { name: "Boolean Algebra: De Morgan’s Laws", category: "Logic", level: "GCSE / A-Level", description: "Negating conjunctions and disjunctions" },
  { name: "Predicate Logic: Quantifiers", category: "Logic", level: "University", description: "For all (∀) and There exists (∃)" },
  { name: "Consistency and Completeness", category: "Logic", level: "University", description: "Meta-mathematics of logical systems" },

  // --- FURTHER MISC ---
  { name: "Fractals: Koch Snowflake", category: "Geometry", level: "High School", description: "Iterative perimeter expansion" },
  { name: "Chaos: The Logistic Map", category: "Analysis", level: "University", description: "Bifurcation and population models" },
  { name: "Graph Theory: Dijkstra's Algorithm", category: "Computing", level: "University", description: "Finding the shortest path in weights" },

  { "name": "Basic Measurement and Units", "category": "Physics", "level": "Primary", "description": "Using rulers, scales, and clocks; understanding length, mass, time, and simple unit conversions" },
  { "name": "Simple Graphs", "category": "Science", "level": "Primary", "description": "Plotting basic bar charts and line graphs from observations" },

  { "name": "Speed = Distance / Time", "category": "Physics", "level": "Middle School", "description": "Calculating speed and rearranging the formula for distance and time" },
  { "name": "Density Calculations", "category": "Physics", "level": "Middle School", "description": "Using density = mass / volume and solving simple problems" },
  { "name": "Temperature and Energy Changes", "category": "Chemistry", "level": "Middle School", "description": "Reading thermometers and basic interpretation of heating graphs" },

  { "name": "Forces and Acceleration", "category": "Physics", "level": "GCSE", "description": "Using F = ma and interpreting motion graphs (velocity-time, distance-time)" },
  { "name": "Energy Calculations", "category": "Physics", "level": "GCSE", "description": "Kinetic and potential energy calculations and efficiency formulas" },
  { "name": "Electric Circuits Calculations", "category": "Physics", "level": "GCSE", "description": "Using V = IR and power equations in circuits" },
  { "name": "Moles and Stoichiometry", "category": "Chemistry", "level": "GCSE", "description": "Calculating amounts of substances using molar mass and balanced equations" },
  { "name": "Radioactivity and Half-Life", "category": "Physics", "level": "GCSE", "description": "Understanding exponential decay and half-life calculations" },

  { "name": "Trigonometry in Physics", "category": "Physics", "level": "GCSE Higher", "description": "Resolving forces and using sine/cosine in vector problems" },
  { "name": "Gas Laws", "category": "Chemistry", "level": "GCSE Higher", "description": "Relationships between pressure, volume, and temperature using proportional reasoning" },
  { "name": "Gradient and Area in Graphs", "category": "Physics", "level": "GCSE Higher", "description": "Using gradients for acceleration and area under graphs for distance" },

  { "name": "SUVAT Equations", "category": "Physics", "level": "A-Level", "description": "Using kinematic equations for motion with constant acceleration" },
  { "name": "Exponentials in Radioactive Decay", "category": "Physics", "level": "A-Level", "description": "Using exponential functions and logarithms to model decay" },
  { "name": "Enthalpy Calculations", "category": "Chemistry", "level": "A-Level", "description": "Bond energies and Hess's Law calculations" },
  { "name": "Equilibrium Constants (Kc)", "category": "Chemistry", "level": "A-Level", "description": "Writing and solving equilibrium expressions mathematically" },
  { "name": "Statistical Analysis in Biology", "category": "Biology", "level": "A-Level", "description": "Using standard deviation and significance tests (e.g. t-test)" },

  { "name": "Calculus in Motion", "category": "Physics", "level": "University", "description": "Using derivatives and integrals to model velocity and acceleration" },
  { "name": "Differential Equations in Physics", "category": "Physics", "level": "University", "description": "Modelling systems like oscillations and circuits with differential equations" },
  { "name": "Quantum Mechanics Mathematics", "category": "Physics", "level": "University", "description": "Wavefunctions, operators, and linear algebra in quantum systems" },
  { "name": "Thermodynamics and Statistical Mechanics", "category": "Physics", "level": "University", "description": "Probability distributions and energy states" },
  { "name": "Reaction Kinetics Modelling", "category": "Chemistry", "level": "University", "description": "Rate equations, orders of reaction, and integrated rate laws" },
  { "name": "Biostatistics and Modelling", "category": "Biology", "level": "University", "description": "Mathematical modelling of populations and biological systems" },

  // --- ADDITIONAL TONS OF NEW TOPICS ---
  // Pure Math
  { "name": "Lie Algebras", "category": "Algebra", "level": "Advanced", "description": "Algebraic structures studying continuous transformation groups" },
  { "name": "Ramsey Theory", "category": "Combinatorics", "level": "University", "description": "Finding order in guaranteed subsets of chaos" },
  { "name": "Betti Numbers", "category": "Topology", "level": "Advanced", "description": "Topological invariants of holes in spaces" },
  { "name": "Algebraic K-Theory", "category": "Algebra", "level": "Advanced", "description": "Studying projective modules and vector bundles" },
  { "name": "Homological Algebra", "category": "Algebra", "level": "Advanced", "description": "Studying homology in algebraic settings" },
  { "name": "Analytic Number Theory", "category": "Number Theory", "level": "Advanced", "description": "Using analysis to solve integer problems" },
  { "name": "Differential Geometry: Riemannian Manifolds", "category": "Geometry", "level": "Advanced", "description": "Curved spaces equipped with metric tensors" },
  
  // Computer Science & AI
  { "name": "Machine Learning: Support Vector Machines", "category": "Computing", "level": "University", "description": "Math of finding optimal hyperplanes" },
  { "name": "Deep Learning: Backpropagation Math", "category": "Computing", "level": "University", "description": "Chain rule applied to neural networks" },
  { "name": "Computer Graphics: Quaternions", "category": "Computing", "level": "University", "description": "4D numbers and 3D rotational math" },
  { "name": "Cryptography: Lattice-Based", "category": "Cryptography", "level": "Advanced", "description": "Post-quantum cryptographic algorithms" },
  { "name": "Algorithms: Bellman-Ford", "category": "Computing", "level": "University", "description": "Shortest paths handling negative weights" },
  { "name": "Randomized Algorithms", "category": "Computing", "level": "University", "description": "Algorithms employing a degree of reasonableness" },
  
  // Applied Math & Physics
  { "name": "Calculus of Variations", "category": "Calculus", "level": "Advanced", "description": "Euler-Lagrange equations for optimizing paths" },
  { "name": "Fluid Dynamics: Navier-Stokes (Detailed)", "category": "Physics", "level": "Advanced", "description": "Differential equations of viscous fluid flow" },
  { "name": "Quantum Field Theory", "category": "Physics", "level": "Advanced", "description": "Mathematical framework uniting QM and special relativity" },
  { "name": "Dynamical Systems: Lyapunov Stability", "category": "Analysis", "level": "University", "description": "Analyzing the stability of equilibrium points" },
  { "name": "Stochastic Differential Equations", "category": "Statistics", "level": "Advanced", "description": "Differential equations with noise terms" },
  
  // Finance & Economics
  { "name": "Financial Math: Ito Calculus", "category": "Finance", "level": "Advanced", "description": "Stochastic calculus applied to finance models" },
  { "name": "Game Theory: Mechanism Design", "category": "Economics", "level": "Advanced", "description": "Engineering games to achieve desired outcomes" },
  { "name": "Portfolio Optimization", "category": "Finance", "level": "University", "description": "Markowitz model and the efficient frontier" },
  { "name": "Actuarial Science: Survival Models", "category": "Finance", "level": "University", "description": "Life contingencies and mortality math" },
  
  // Statistics and Optimization
  { "name": "Markov Chain Monte Carlo (MCMC)", "category": "Statistics", "level": "Advanced", "description": "Algorithms for sampling probability distributions" },
  { "name": "Non-linear Programming", "category": "Optimization", "level": "Advanced", "description": "Solving optimization problems with non-linear constraints" },
  { "name": "Convex Optimization", "category": "Optimization", "level": "University", "description": "The math of minimizing convex functions" },
  { "name": "Game Theory: Cooperative Games", "category": "Logic", "level": "University", "description": "Coalitions and the Shapley Value" },
  { "name": "Time Series Analysis", "category": "Statistics", "level": "University", "description": "ARIMA and forecasting sequential data" },
  { "name": "Principal Component Analysis", "category": "Statistics", "level": "University", "description": "Eigenvectors in dimensionality reduction" },
  
  // Primary & Middle School Additions
  { "name": "Understanding Roman Numerals", "category": "History", "level": "Primary", "description": "Translating and computing with Roman digits" },
  { "name": "Money Mathematics", "category": "Arithmetic", "level": "Primary", "description": "Adding, subtracting, and giving change in diverse currencies" },
  { "name": "Reflection and Symmetry", "category": "Geometry", "level": "Primary", "description": "Finding lines of symmetry in 2D shapes" },
  { "name": "Reading Coordinates", "category": "Geometry", "level": "Primary", "description": "Navigating simple grids with (x, y)" },
  { "name": "Volume of Prisms (Basic)", "category": "Geometry", "level": "Middle School", "description": "Lengths x Widths x Heights of cubes and cuboids" },
  { "name": "Angle Bearings", "category": "Geometry", "level": "Middle School", "description": "Navigating maps using 3-figure degree bearings" },
  { "name": "Conversion of Area & Volume Units", "category": "Arithmetic", "level": "Middle School", "description": "Squaring and cubing metric conversion factors" },
  { "name": "Hyperbolic Functions (Intro)", "category": "Calculus", "level": "A-Level Further", "description": "Introduction to sinh, cosh, and tanh functions" },
  { "name": "Geometric Proofs with Circles", "category": "Geometry", "level": ["GCSE Higher", "AQA GCSE Further Maths"], "description": "Advanced proofs using circle theorems and congruence" },
  { "name": "Polynomial Graphs (Higher Degree)", "category": "Algebra", "level": ["GCSE Higher", "AQA GCSE Further Maths"], "description": "Sketching and analyzing graphs of degree 3 and 4" }
];
