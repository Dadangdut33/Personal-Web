// Clean genereated SQL files from drizzle to remove DO blocks and occurrences of "public"
// The sql files can then be run through the xata dashboard
import * as fs from "fs";
import * as path from "path";

// Remove the DO blocks and occurrences of "public" from the SQL content
const cleanSQL = (sqlContent: string): string => {
  // Regular expression to match DO blocks and capture the content inside BEGIN and END
  // @ts-ignore
  const doBlockRegex = /DO\s+\$\$.*?BEGIN\s+(.*?)\s+EXCEPTION.*?END\s+\$\$;/gs;

  // Remove DO blocks but keep the statements inside
  const cleanedContent = sqlContent.replace(doBlockRegex, "$1");

  // Remove occurrences of "public".
  const finalContent = cleanedContent.replace(/"public"\./g, "");

  return finalContent;
};

// Function to read, process, and write SQL content
function processSqlFile(inputFilePath: string, outputFilePath: string): void {
  // Read the input SQL file
  const sqlContent = fs.readFileSync(inputFilePath, "utf-8");

  // Process the SQL content
  const cleanedSql = cleanSQL(sqlContent);

  // Write the cleaned SQL to the output file
  fs.writeFileSync(outputFilePath, cleanedSql, "utf-8");
}

const run = async () => {
  // Define input and output file paths
  const inputDirPath = path.join(__dirname, "../drizzle/generated");
  const outputDirPath = path.join(__dirname, "../drizzle/cleaned");

  // Process the SQL file
  const files = fs.readdirSync(inputDirPath);
  files.forEach((file) => {
    if (!file.endsWith(".sql")) return;

    // Process each file in the input directory
    console.log(`Processing file: ${path.join(inputDirPath, file)}`);
    processSqlFile(path.join(inputDirPath, file), path.join(outputDirPath, file));
  });
  console.log("Cleaned successfully.");
};

run().catch((err) => {
  console.error("❌ Cleaning failed");
  console.error(err);
  process.exit(1);
});
