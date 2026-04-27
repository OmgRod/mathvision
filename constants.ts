
export interface MathTopic {
  name: string;
  category: string;
  level: string; // e.g., Middle School, High School, University, GCSE, A-Level
  description: string;
}

export const PRACTICE_TOPICS: MathTopic[] = [
  // --- AQA FURTHER MATHS GCSE ---
  { name: "Surds and Rationalizing", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Complex surd manipulation and rationalizing denominators with multiple terms" },
  { name: "Factor Theorem", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Using the factor theorem to factorise cubic polynomials" },
  { name: "Algebraic Fractions: Solving", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Solving equations involving algebraic fractions" },
  { name: "Indices: Rational and Negative", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Advanced index laws including fractional and negative powers" },
  { name: "Quadratic Inequalities", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Solving and graphing regions for quadratic inequalities" },
  { name: "Simultaneous Equations: Linear and Quadratic", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Solving systems where one equation is non-linear" },
  { name: "Function Notation and Composites", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Evaluating f(g(x)) and finding inverse functions g^-1(x)" },
  { name: "Quadratic Sequences (nth term)", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Finding the nth term formula for sequences with a second difference" },
  { name: "Limiting Value of a Sequence", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Determining what value a sequence approaches as n goes to infinity" },
  { name: "Differentiation: Fundamentals", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Power rule differentiation for polynomials" },
  { name: "Tangents and Normals", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Finding the equation of a tangent or normal line to a curve" },
  { name: "Stationary Points and Nature", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Identifying max/min points using the second derivative" },
  { name: "Matrix Multiplication", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Multiplying 2x2 and 2x1 matrices" },
  { name: "Matrix Transformations: Rotations", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Using matrices to rotate shapes about the origin" },
  { name: "Matrix Transformations: Reflections", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Reflecting shapes using 2x2 transformation matrices" },
  { name: "Identity Matrix and Inverse", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Properties of the identity matrix and finding 2x2 inverses" },
  { name: "Trig Identities: Sin/Cos/Tan", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Proving identities using sin^2 + cos^2 = 1 and tan = sin/cos" },
  { name: "Solving Trig Equations", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Finding all solutions for sin(x) = k within 0 to 360 degrees" },
  { name: "Trigonometry in 3D", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Applying sine and cosine rules to 3D pyramids and prisms" },
  { name: "Equation of a Circle (Origin)", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Calculations with x^2 + y^2 = r^2" },
  { name: "Equation of a Circle (Any center)", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Calculations with (x-a)^2 + (y-b)^2 = r^2" },
  { name: "Geometric Proof", category: "Further Maths GCSE", level: "AQA Further Maths", description: "Formulating formal proofs for circle theorems and congruence" },

  // --- ALGEBRA (Expanded) ---
  { name: "Basic Linear Equations", category: "Algebra", level: "Middle School", description: "One and two-step equations like x + 5 = 10" },
  { name: "Advanced Linear Equations", category: "Algebra", level: "GCSE", description: "Equations with variables on both sides and brackets" },
  { name: "Factoring Quadratics (a=1)", category: "Algebra", level: "GCSE", description: "Factoring trinomials where x^2 coefficient is 1" },
  { name: "Factoring Quadratics (a>1)", category: "Algebra", level: "GCSE Higher", description: "Factoring trinomials using the split-middle-term method" },
  { name: "Completing the Square", category: "Algebra", level: "High School", description: "Rewriting quadratics into vertex form" },
  { name: "The Quadratic Formula", category: "Algebra", level: "High School", description: "Finding roots using (-b ± sqrt(b^2 - 4ac)) / 2a" },
  { name: "The Discriminant", category: "Algebra", level: "A-Level", description: "Determining the number of real roots using b^2 - 4ac" },
  { name: "Partial Fractions (Linear)", category: "Algebra", level: "A-Level", description: "Splitting fractions with distinct linear factors" },
  { name: "Partial Fractions (Repeated)", category: "Algebra", level: "University", description: "Splitting fractions with repeated linear factors" },
  { name: "Partial Fractions (Quadratic)", category: "Algebra", level: "University", description: "Splitting fractions with irreducible quadratic factors" },
  { name: "Logarithm Laws", category: "Algebra", level: "High School", description: "Product, quotient, and power laws of logs" },
  { name: "Change of Base Formula", category: "Algebra", level: "A-Level", description: "Converting logs between different bases" },
  { name: "Natural Logarithms (ln)", category: "Algebra", level: "A-Level", description: "Solving equations involving base e" },
  { name: "Binomial Expansion (n is int)", category: "Algebra", level: "High School", description: "Expanding (a+b)^n for positive integers n" },
  { name: "Binomial Expansion (Any n)", category: "Algebra", level: "A-Level", description: "Expanding (1+x)^n for fractional or negative n" },
  { name: "Modulus Equations", category: "Algebra", level: "A-Level", description: "Solving equations involving absolute values |f(x)| = g(x)" },
  { name: "Modulus Inequalities", category: "Algebra", level: "A-Level", description: "Solving |f(x)| < k and |f(x)| > k" },

  // --- CALCULUS (Expanded) ---
  { name: "Differentiation from First Principles", category: "Calculus", level: "A-Level", description: "Finding the derivative using the limit definition" },
  { name: "Differentiating Trig Functions", category: "Calculus", level: "A-Level", description: "Derivatives of sin, cos, and tan" },
  { name: "Differentiating Exp and Logs", category: "Calculus", level: "A-Level", description: "Derivatives of e^x and ln(x)" },
  { name: "Implicit Differentiation", category: "Calculus", level: "A-Level", description: "Differentiating terms involving y with respect to x" },
  { name: "Connected Rates of Change", category: "Calculus", level: "A-Level", description: "Applying the chain rule to related physical rates" },
  { name: "Integration: Simple Trig", category: "Calculus", level: "A-Level", description: "Integrating sin(ax) and cos(ax)" },
  { name: "Integration: 1/x and e^x", category: "Calculus", level: "A-Level", description: "Integrals yielding natural logs and exponentials" },
  { name: "Area Between Curves", category: "Calculus", level: "A-Level", description: "Integrating the difference between two functions" },
  { name: "Volume of Revolution", category: "Calculus", level: "A-Level", description: "Rotating a curve about the x-axis or y-axis" },
  { name: "Integrating using Trig Identities", category: "Calculus", level: "A-Level", description: "Using sin^2 or cos^2 identities before integrating" },
  { name: "Simpson's Rule", category: "Calculus", level: "University", description: "Numerical integration using parabolic segments" },
  { name: "The Trapezium Rule", category: "Calculus", level: "A-Level", description: "Numerical approximation of area under a curve" },
  { name: "Maclaurin Series", category: "Calculus", level: "University", description: "Infinite series representation of functions at x=0" },
  { name: "Vector Calculus: Div and Curl", category: "Calculus", level: "University", description: "Divergence and curl of vector fields" },
  { name: "Line Integrals", category: "Calculus", level: "University", description: "Integration along a path in a vector field" },

  // --- GEOMETRY (Expanded) ---
  { name: "Angles on a Line and Point", category: "Geometry", level: "Middle School", description: "Basic angle rules: 180 and 360 degrees" },
  { name: "Parallel Line Angles", category: "Geometry", level: "Middle School", description: "Corresponding, alternate, and co-interior angles" },
  { name: "Congruence Criteria (SSS, SAS, etc.)", category: "Geometry", level: "GCSE", description: "Proving two triangles are identical" },
  { name: "Similarity in 2D", category: "Geometry", level: "GCSE", description: "Scale factors and similar shapes" },
  { name: "Area and Volume Scale Factors", category: "Geometry", level: "GCSE Higher", description: "Relationships between L, A, and V scale factors" },
  { name: "Cosine Rule: Side", category: "Trigonometry", level: "GCSE Higher", description: "Finding a side when given SAS" },
  { name: "Cosine Rule: Angle", category: "Trigonometry", level: "GCSE Higher", description: "Finding an angle when given all sides (SSS)" },
  { name: "Sine Rule: Ambiguous Case", category: "Trigonometry", level: "A-Level", description: "When SIN rule gives two possible triangles" },
  { name: "Bearings", category: "Geometry", level: "GCSE", description: "Navigation using three-figure bearings from North" },
  { name: "Vector Proof in Geometry", category: "Vectors", level: "GCSE Higher", description: "Using vectors to prove points are collinear" },
  { name: "Circle Properties: Segments", category: "Geometry", level: "GCSE", description: "Calculating area of sectors and segments" },

  // --- STATISTICS (Expanded) ---
  { name: "Box and Whisker Plots", category: "Statistics", level: "GCSE", description: "Visualizing quartiles and outliers" },
  { name: "Cumulative Frequency", category: "Statistics", level: "GCSE Higher", description: "Drawing curves to find the median and IQR" },
  { name: "Histograms (Frequency Density)", category: "Statistics", level: "GCSE Higher", description: "Representing data with unequal class widths" },
  { name: "Probability Trees", category: "Probability", level: "GCSE", description: "Visualizing unconditional and conditional probability" },
  { name: "Geometric Distribution", category: "Statistics", level: "University", description: "Number of trials until the first success" },
  { name: "Poisson Distribution", category: "Statistics", level: "University", description: "Modeling occurrences in a fixed interval" },
  { name: "Hypothesis Testing: Binomial", category: "Statistics", level: "A-Level", description: "Testing if a success rate has changed" },
  { name: "Hypothesis Testing: Normal", category: "Statistics", level: "A-Level", description: "Testing sample means" },
  { name: "Z-Tests and T-Tests", category: "Statistics", level: "University", description: "Comparing means for different sample sizes" },
  { name: "Chi-Squared Independence Test", category: "Statistics", level: "University", description: "Testing if two categorical variables are related" },

  // --- DISCRETE & LOGIC (Expanded) ---
  { name: "Truth Tables", category: "Logic", level: "University", description: "Evaluating logic expressions with AND, OR, NOT, XOR" },
  { name: "Dijkstra's Algorithm", category: "Graph Theory", level: "A-Level / Uni", description: "Finding the shortest path between nodes" },
  { name: "Kruskal's Algorithm", category: "Graph Theory", level: "A-Level / Uni", description: "Finding the Minimum Spanning Tree" },
  { name: "Critical Path Analysis", category: "Discrete Math", level: "A-Level", description: "Finding the minimum time to complete a project" },
  { name: "Chinese Remainder Theorem", category: "Number Theory", level: "University", description: "Solving systems of linear congruences" },
  { name: "Euclidean Algorithm", category: "Number Theory", level: "University", description: "Efficiently finding the GCD of two numbers" },
  { name: "Fermat's Little Theorem", category: "Number Theory", level: "University", description: "Exponentiation properties in prime modular arithmetic" },

  // --- COMPLEX & ADVANCED ---
  { name: "Argand Diagrams", category: "Complex Numbers", level: "A-Level / Uni", description: "Plotting complex numbers and operations" },
  { name: "De Moivre's Theorem", category: "Complex Numbers", level: "University", description: "Finding powers and roots of complex numbers" },
  { name: "Exponential Form (Euler's)", category: "Complex Numbers", level: "University", description: "Working with re^(iy)" },
  { name: "Eigenvalues and Eigenvectors", category: "Matrices", level: "University", description: "Finding characteristic equations and vectors" },
  { name: "Matrix Diagonalization", category: "Matrices", level: "University", description: "Converting matrices to diagonal form" },
  { name: "Second Order ODEs (Homogeneous)", category: "Calculus", level: "University", description: "Solving ay'' + by' + cy = 0" },
  { name: "Second Order ODEs (Particular Integral)", category: "Calculus", level: "University", description: "Solving equations with non-zero right hand sides" },
  { name: "Vector Lines in 3D", category: "Vectors", level: "A-Level", description: "Equations of lines in 3D space" },
  { name: "Vector Planes", category: "Vectors", level: "University", description: "Equations of planes and intersections" },

  // --- ARITHMETIC & FOUNDATION ---
  { name: "Standard Form Calculation", category: "Arithmetic", level: "GCSE", description: "Multiplying and dividing with indices" },
  { name: "Reverse Percentages", category: "Arithmetic", level: "GCSE", description: "Finding the original cost after a change" },
  { name: "Compound Interest", category: "Arithmetic", level: "GCSE", description: "Repeated percentage changes over time" },
  { name: "Direct and Inverse Proportion", category: "Arithmetic", level: "GCSE Higher", description: "y = kx and y = k/x problems" },
  { name: "Lower and Upper Bounds", category: "Arithmetic", level: "GCSE Higher", description: "Calculations with rounded numbers" },
  { name: "Error Intervals", category: "Arithmetic", level: "GCSE", description: "Specifying ranges for truncated or rounded values" },
  { name: "Ratio Sharing", category: "Arithmetic", level: "Middle School", description: "Dividing quantities using parts" },
  { name: "Product of Prime Factors", category: "Arithmetic", level: "Middle School", description: "Tree diagrams and index notation" },
  { name: "HCF and LCM (Venn)", category: "Arithmetic", level: "Middle School", description: "Finding overlaps in factor sets" }
];

