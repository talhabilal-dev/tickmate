import { searchSimilarResolvedPublicTickets } from "../utils/vector-db.utils.js";

const query = {
  title: "Authentication issue",
  description: "I can't log in to my account, the page just shows a blank screen",
  category: "Bug",
};

async function testSearchVerbose() {
  console.log("🔍 Verbose Semantic Search Test\n");
  console.log("=" .repeat(80));
  console.log(`\n📝 Query:`);
  console.log(`   Title: "${query.title}"`);
  console.log(`   Description: "${query.description}"`);
  console.log(`   Category: ${query.category}`);
  console.log(`\n🔎 Searching with minScore=0.5...\n`);

  try {
    const results = await searchSimilarResolvedPublicTickets({
      title: query.title,
      description: query.description,
      category: query.category,
      limit: 10,
      minScore: 0.5, // Lower threshold to see more results
    });

    if (results.length === 0) {
      console.log("   ❌ No similar tickets found\n");
      return;
    }

    console.log(`   ✅ Found ${results.length} similar ticket(s):\n`);

    results.forEach((result, idx) => {
      console.log(`   ${idx + 1}. 🎫 Ticket #${result.ticket.id}`);
      console.log(`      Title: "${result.ticket.title}"`);
      console.log(`      Similarity Score: ${(result.score * 100).toFixed(2)}%`);
      console.log(`      Category: ${result.ticket.category}`);
      console.log(`      Status: ${result.ticket.status}`);
      console.log(`      Skills: ${result.ticket.relatedSkills.join(", ")}`);
      console.log(`      Description Preview: ${result.ticket.description.substring(0, 100)}...`);
      if (idx < results.length - 1) console.log();
    });

  } catch (error) {
    console.log(`\n   ❌ Error: ${error instanceof Error ? error.message : error}\n`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n✨ Test completed!\n");
}

testSearchVerbose()
  .then(() => {
    console.log("✅ Test script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });
