import { searchSimilarResolvedPublicTickets } from "../utils/vector-db.utils.js";

const TEST_QUERIES = [
  {
    title: "Authentication issue",
    description: "I can't log in to my account, the page just shows a blank screen",
    category: "Bug",
  },
  {
    title: "Password recovery not working",
    description: "Tried to reset my password but didn't receive any email",
    category: "Bug",
  },
  {
    title: "Dark theme request",
    description: "Would love to have a dark mode option for night time use",
    category: "Feature Request",
  },
  {
    title: "Performance problems with ticket list",
    description: "The tickets page is really slow when I have many tickets",
    category: "Performance",
  },
  {
    title: "Mobile display issues",
    description: "The app doesn't look right on my phone, buttons are hard to click",
    category: "Bug",
  },
];

async function testSearch() {
  console.log("🔍 Testing Semantic Search Functionality\n");
  console.log("=" .repeat(80));

  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const query = TEST_QUERIES[i];
    console.log(`\n📝 Test Query #${i + 1}:`);
    console.log(`   Title: "${query.title}"`);
    console.log(`   Description: "${query.description}"`);
    console.log(`   Category: ${query.category}`);

    try {
      const results = await searchSimilarResolvedPublicTickets({
        title: query.title,
        description: query.description,
        category: query.category,
        limit: 3,
      });

      if (results.length === 0) {
        console.log("\n   ❌ No similar tickets found\n");
        continue;
      }

      console.log(`\n   ✅ Found ${results.length} similar ticket(s):\n`);

      results.forEach((result, idx) => {
        console.log(`   ${idx + 1}. 🎫 Ticket #${result.ticket.id}`);
        console.log(`      Title: "${result.ticket.title}"`);
        console.log(`      Similarity Score: ${(result.score * 100).toFixed(2)}%`);
        console.log(`      Category: ${result.ticket.category}`);
        console.log(`      Skills: ${result.ticket.relatedSkills.join(", ")}`);
        if (idx < results.length - 1) console.log();
      });

    } catch (error) {
      console.log(`\n   ❌ Error: ${error instanceof Error ? error.message : error}\n`);
    }

    console.log("\n" + "-".repeat(80));
  }

  console.log("\n✨ Search test completed!\n");
}

testSearch()
  .then(() => {
    console.log("✅ Test script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });
