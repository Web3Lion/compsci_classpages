// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================
   WEB3 — CTF content (challenges, boss questions, frameworks).
   Loaded right after ../config.js by web3/ctf.html, web3/profile.html and the
   teacher pages. Edit challenges HERE, in the one challenges: [ ... ] array.
   ============================================================ */
window.COURSE_CONFIG = window.COURSE_CONFIG || {};
window.COURSE_CONFIG.web3 = window.COURSE_CONFIG.web3 || {};


/* ============================================================
   PROOF OF WORK (Web 3.0) — mentor mode, guide = ORACLE.
   Questions NOT authored yet. Add flags to .challenges and
   applied questions to .bossQuestions when ready.
   ============================================================ */
window.COURSE_CONFIG.web3.ctf = {
  title: "Proof of Work",
  mentor: true,
  intro: "Welcome to Proof of Work. Prove what you know across the world of Web 3.0 \u2014 each capture maps to a course objective and earns XP. Your guide ORACLE is here to help you reach consensus. Progress saves on this device.",
  adversary: "ORACLE",
  adversaryColor: "#f7931a",
  adversaryColor2: "#ffb454",
  adversaryGlow: "#f7931a",
  modules: ["Web 3 Principles & Blockchain","Cryptocurrencies","NFTs","Digital Wallets","Blockchain Coding","DAOs","DApps","Applied Application"],
  challenges: [

  /* MODULE 1 — Web 3 Principles & Blockchain ──────────────────────────────── */
  { id: "w3-m1a", module: 1, title: "Blockchain Foundations", category: "Blockchain Basics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Blockchain fundamentals. A shared, append-only ledger of transactions stored in linked blocks is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Blocks linked in a chain.",
        flagHash: "7937ea509b73d988b162e6ab3afd5a3e4a1b8c0a3cc773aae6f16b6564233e44" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Decentralization. A network with no single central authority, where copies of the ledger are spread across many nodes, is ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "No single point of control.",
        flagHash: "4f15cbe9facaa2c22ded8ffe4f5fd812f5d05a3163faa851b4e3409d2316550c" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Blockchain fundamentals. Once data is confirmed on the chain it cannot be altered. This property is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Cannot be changed after the fact.",
        flagHash: "c49b5deed9c8d7547e3b7ce3d4507f6eb826c1faf33c328f87131a1709cc1fbf" }
    ] },

  { id: "w3-m1b", module: 1, title: "Consensus & Hashing", category: "Blockchain Basics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Blockchain fundamentals. A single computer that stores a copy of the blockchain and helps validate it is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "One computer on the network.",
        flagHash: "451140ce83d260df5dfb991be747dc58ab9dd8ec4f1ee1271b5eabba10dacb1a" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Cryptography & hashing. A one-way function that turns any input into a fixed-length fingerprint, linking each block to the last, produces a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A fixed-length fingerprint.",
        flagHash: "deaed1f0d22fe5f2c4aa644d8fa1a50028d36f4e36358e9ea9545ec274adaa4e" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Consensus mechanisms. The consensus mechanism where miners expend computing power to solve a puzzle and add the next block is called ___ ___ ___.\n\nSubmit as flag{three words} (lowercase).",
        hint: "Miners race to solve a puzzle.",
        flagHash: "7978f248a7b9741dd3d1db7281e85671319f62428f305fa0bfb8118aa7107c12" }
    ] },

  { id: "w3-m8a", module: 1, title: "Ecosystem Terms", category: "Blockchain Basics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Web 3 principles. The name for the decentralized, blockchain-based era of the internet is ___.\n\nSubmit as flag{word} (lowercase, no space).",
        hint: "The decentralized web.",
        flagHash: "ef79dff314ff51d6cce3b4829be8a73fa00eebb404f6d7ae3b01cb823d6efd41" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Blockchain fundamentals. The shared record of all transactions on a blockchain is called the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The record of transactions.",
        flagHash: "16a04009c9c5fbdf408cdcbce2e16ee2f6132ec0b121366b7e1717e4aabb97d5" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Consensus mechanisms. The energy-efficient consensus where validators lock up coins as collateral is called ___ ___ ___.\n\nSubmit as flag{three words} (lowercase).",
        hint: "Validators lock up coins.",
        flagHash: "2a6b5e5cc189aec303cf9b24132571944977d476d90249e8868a0a35af70891f" }
    ] },

  { id: "w3-m1-parts", module: 1, title: "Parts of a Block", category: "Blockchain Basics", type: "match", points: 150,
    intro: "Objective — Blockchain fundamentals. Match each part of a block to what it holds. Tap a part, then tap its meaning.",
    pairs: [
      { left: "Hash", right: "This block's unique fingerprint" },
      { left: "Previous hash", right: "Links to the block before it" },
      { left: "Transactions", right: "The data recorded in the block" },
      { left: "Nonce", right: "Number miners change to solve the puzzle" }
    ] },

  { id: "w3-m1-mine", module: 1, title: "Add a Block to the Chain", category: "Blockchain Basics", type: "order", points: 150,
    intro: "Objective — Consensus mechanisms. Order the steps to add a new block using proof of work, first to last.",
    steps: [
      "Collect pending transactions",
      "Bundle them into a candidate block",
      "Miners race to solve the hash puzzle",
      "The network verifies the winning block",
      "The block is added to every copy of the chain"
    ] },

  { id: "w3-m1-cf", module: 1, title: "Centralized or Decentralized?", category: "Blockchain Basics", type: "match", points: 150,
    intro: "Objective — Centralization vs decentralization. Sort each system. Tap the example, then tap its type.",
    pairs: [
      { left: "A single bank's database", right: "Centralized" },
      { left: "The Bitcoin network", right: "Decentralized" },
      { left: "One company's server", right: "Centralized" },
      { left: "Thousands of nodes sharing a ledger", right: "Decentralized" }
    ] },

  { id: "w3-m8-consensus", module: 1, title: "PoW vs PoS", category: "Blockchain Basics", type: "match", points: 150,
    intro: "Objective — Proof of work vs proof of stake. Sort each trait to its mechanism. Tap the trait, then tap the mechanism.",
    pairs: [
      { left: "Miners solve puzzles with computing power", right: "Proof of Work" },
      { left: "Validators lock up coins as collateral", right: "Proof of Stake" },
      { left: "Very energy intensive", right: "Proof of Work" },
      { left: "More energy efficient", right: "Proof of Stake" }
    ] },

  { id: "w3-m8-glossary", module: 1, title: "Web3 Glossary Match", category: "Blockchain Basics", type: "match", points: 150,
    intro: "Objective — Web 3 principles. Match each term to its meaning. Tap a term, then tap its meaning.",
    pairs: [
      { left: "Ledger", right: "The shared record of transactions" },
      { left: "Gas fee", right: "Cost to process a transaction" },
      { left: "Rug pull", right: "Creators flee with the funds" },
      { left: "Web3", right: "The decentralized internet era" }
    ] },

  { id: "w3-m1-vocab", module: 1, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["blockchain","block","hash","node","decentralized","ledger","consensus","proof of work","immutable","mining"],
    hardMode: "rapid" },

  { id: "w3-web-eras", module: 1, title: "The Web Through Time", category: "Blockchain Basics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Web evolution. Web 1.0 let you read and Web 2.0 let you read and write. Web 3.0 adds a third verb — read, write, and ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Whose stuff is it?",
        flagHash: "83da5478e43d674f4d68013b2d0447eef7bcbecc4ed7943538fcdfcf6c1596e9" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Web 3 principles. Web 2.0 platforms hold your account and can close it. A Web 3.0 wallet that no company can freeze or delete is described as ___. (one word)",
        hint: "Nobody needs to grant you access.",
        flagHash: "252c457308042736934d5492ebe74804e7fd277a422351d05a567e67c342bcbc" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Blockchain use cases. Tracking a product from farm to shelf so every handoff is verifiable is the ___ ___ use case.\n\nSubmit as flag{two words} (lowercase).",
        hint: "How goods reach a store.",
        flagHash: "6f3c7a3e988f6873a007d952d166de07242625a33eb56cdbc1e692036b57d931" }
    ] },

  /* MODULE 2 — Cryptocurrencies ───────────────────────────────────────────── */
  { id: "w3-m3a", module: 2, title: "Coins & Tokens", category: "Cryptocurrencies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Coins & tokens. A digital asset created and managed on an existing blockchain is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A unit of value on a chain.",
        flagHash: "777343ab04f23add13eab005e5d5f438311c8b873ae7179d0f050845a9715990" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Gas fees. The fee paid to run a transaction or contract on Ethereum is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The fee to run a transaction.",
        flagHash: "77f8178a7fda468b8f3d105b49c4327131ab5eded25f835562d4ee29a83ea0d9" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Coins & tokens. A token designed to hold a steady value by pegging to an asset like the US dollar is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Pegged to a stable value.",
        flagHash: "93219be3db5581f65057ddc74bc12beec724d6908d6943a8f0f1b75e752b7d15" }
    ] },

  { id: "w3-m3b", module: 2, title: "Standards & Value", category: "Cryptocurrencies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Tokenomics. A token where every unit is identical and interchangeable is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Interchangeable, like dollars.",
        flagHash: "28abd36ff7b1b8293fa3d3ac6310575b940c179254176049533897588d1e9a4b" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Coins & tokens. A digital currency secured by cryptography and running on a blockchain is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Digital money on a chain.",
        flagHash: "40c7e1eaa60e4338bf0193372af2082ab3927a61013bb68afd85ac9f2d8ab00a" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Tokenomics. The Ethereum standard that defines how fungible tokens behave is ___.\n\nSubmit as flag{standard} (lowercase, keep the hyphen).",
        hint: "Ethereum fungible-token standard.",
        flagHash: "3aacebec9f504e2ad270d881e8f3359b7afa3c33755bcf6eeab4e26aa1b67b76" }
    ] },

  { id: "w3-m8b", module: 2, title: "Risks & Safety", category: "Cryptocurrencies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Wallet security. A fraudulent scheme designed to steal crypto or keys is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A fraud to avoid.",
        flagHash: "fa1964123faa234e3ad0c7c8da65f0cf85e900c76e1488c7043b1f69926979c1" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Smart contract risk. A scam where creators abandon a project and run off with investors' funds is a ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Devs vanish with the money.",
        flagHash: "07674a056eaacf673c4d6e71db3254ead7f5aee1e532b16694b95d38fbf39cbe" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Gas fees. The charge paid to process a transaction on the network is the ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "What you pay the network to include and execute your transaction. It rises when the network is busy. Two words.",
        flagHash: "582c94eddd908816ff0b7eaaa55df49d419d8d8bfec30a36f82530048eb97401" }
    ] },

  { id: "w3-m3-types", module: 2, title: "Match the Token Type", category: "Cryptocurrencies", type: "match", points: 150,
    intro: "Objective — Coins & tokens. Match each token to its description. Tap a token, then tap its description.",
    pairs: [
      { left: "Stablecoin", right: "Pegged to a steady value like USD" },
      { left: "Governance token", right: "Grants voting power in a DAO" },
      { left: "Utility token", right: "Used to access a product or service" },
      { left: "NFT", right: "Represents a unique item" }
    ] },

  { id: "w3-m3-ff", module: 2, title: "Fungible or Non-Fungible?", category: "Cryptocurrencies", type: "match", points: 150,
    intro: "Objective — Fungibility. Sort each item. Tap the item, then tap the category.",
    pairs: [
      { left: "One dollar bill for another", right: "Fungible" },
      { left: "A specific numbered trading card", right: "Non-Fungible" },
      { left: "One Bitcoin for another Bitcoin", right: "Fungible" },
      { left: "A unique piece of digital art", right: "Non-Fungible" }
    ] },

  { id: "w3-m3-fee", module: 2, title: "How a Gas Fee Works", category: "Cryptocurrencies", type: "order", points: 150,
    intro: "Objective — Gas fees. Order what happens with gas on a transaction, first to last.",
    steps: [
      "You submit a transaction",
      "The network estimates the gas needed",
      "You pay the gas fee",
      "Validators process the transaction",
      "The transaction is confirmed"
    ] },

  { id: "w3-m3-vocab", module: 2, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["token","coin","gas","stablecoin","fungible","cryptocurrency","erc","utility","supply"],
    hardMode: "speedmatch" },

  /* MODULE 3 — NFTs ───────────────────────────────────────────────────────── */
  { id: "w3-m4a", module: 3, title: "What Is an NFT?", category: "NFTs",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — NFT fundamentals. A one-of-a-kind token that proves ownership of a unique digital item is abbreviated ___.\n\nSubmit as flag{abbreviation} (lowercase).",
        hint: "Three letters. The token is one of a kind — you can't swap it for another.",
        flagHash: "036644b3363b146e712afd7ead72b4287247582b0f81175bd1320ed38a3cdcdd" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — NFT characteristics. A token that is unique and cannot be swapped one-for-one with another is ___.\n\nSubmit as flag{word} (lowercase, keep the hyphen).",
        hint: "Each token is unique and can't be swapped one-for-one with another. Hyphenated.",
        flagHash: "ca18db12688eb6c70b4c0f7b53c10cd3346be7f47c782e6c13e5d6aba231582e" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Creating an NFT. The process of publishing a new NFT onto the blockchain is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Creating the token on-chain.",
        flagHash: "4a373afdb00259be10b46fc1938c504d00a29def769bce8e9561a2a59d6ae42a" }
    ] },

  { id: "w3-m4b", module: 3, title: "Ownership & Metadata", category: "NFTs",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — NFT characteristics. An NFT recorded on-chain provides verifiable proof of ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The NFT proves this.",
        flagHash: "d1e610099b17a5b008e801609d52f09d63d7f7a600bc1fe6c0666aa991b578a2" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — NFT metadata. The information describing an NFT — its name, traits, and image link — is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Data describing the asset.",
        flagHash: "951adea39b54dd0ebb4028b560b787f549cddb92c4c371855307423c2a2db29f" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — NFT metadata. The distributed file system often used to store NFT media off-chain is abbreviated ___.\n\nSubmit as flag{abbreviation} (lowercase).",
        hint: "Distributed file storage.",
        flagHash: "c14bd5913924191c2a64a25fac8c71abd85279d2fd89208757864e1e64fd85f0" }
    ] },

  { id: "w3-m4-mint", module: 3, title: "Mint an NFT", category: "NFTs", type: "order", points: 150,
    intro: "Objective — Creating an NFT. Order the steps to mint an NFT, first to last.",
    steps: [
      "Create the digital asset",
      "Upload the media and metadata",
      "Connect your wallet to the platform",
      "Pay the gas fee to mint",
      "The NFT is recorded on-chain"
    ] },

  { id: "w3-m4-terms", module: 3, title: "Match the NFT Term", category: "NFTs", type: "match", points: 150,
    intro: "Objective — NFT fundamentals. Match each term to its meaning. Tap a term, then tap its meaning.",
    pairs: [
      { left: "Minting", right: "Publishing an NFT on-chain" },
      { left: "Metadata", right: "The traits and media link" },
      { left: "Marketplace", right: "Where NFTs are bought and sold" },
      { left: "Royalty", right: "A cut the creator earns on resale" }
    ] },

  { id: "w3-m4-myth", module: 3, title: "NFT: True or False?", category: "NFTs", type: "match", points: 150,
    intro: "Objective — NFT characteristics. Sort each statement. Tap the statement, then tap True or False.",
    pairs: [
      { left: "An NFT proves on-chain ownership of a token", right: "True" },
      { left: "Owning an NFT always gives full copyright", right: "False" },
      { left: "Each NFT has a unique identifier", right: "True" },
      { left: "NFTs are interchangeable one-for-one", right: "False" }
    ] },

  { id: "w3-m4-vocab", module: 3, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["nft","non-fungible","mint","minting","metadata","ownership","royalty","ipfs","collectible"],
    hardMode: "blitz" },

  { id: "w3-nft-law", module: 3, title: "Law, Tax & Rights", category: "NFTs",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — NFT law & regulation. Profit made from selling an NFT for more than you paid is generally taxed as a capital ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of a loss.",
        flagHash: "74ef61006fade5ab2dca75568fec3acd8ffbe01ca6df05483a6dd61d580c0301" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — NFT law & regulation. Buying an NFT of an artwork does not transfer the artist's underlying ___ unless the sale says so.\n\nSubmit as flag{word} (lowercase).",
        hint: "The right to reproduce it.",
        flagHash: "7b5d1a4db073d1358859d752555b4ef945495a103b90146d503aff0e3f751a55" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — NFT law & regulation. A percentage paid to the original creator on every later resale, written into the contract, is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Musicians get these too.",
        flagHash: "72ee939aa83c28c312dbc326c8c3f0ccc03e03988d2cfb42f920a3f78318b340" }
    ] },

  /* MODULE 4 — Digital Wallets ────────────────────────────────────────────── */
  { id: "w3-m2a", module: 4, title: "Keys & Wallets", category: "Digital Wallets",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Wallet types. The software or device that stores your keys and lets you send and receive crypto is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Holds your keys.",
        flagHash: "ebcaa50801688ebe0fc816606329c54551cd6d9679cef3cf4b69abb211bbec4d" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Public & private keys. The secret that proves ownership and must NEVER be shared is your ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "The secret half of your keypair. Whoever holds it controls the funds. Two words.",
        flagHash: "74f61448a78aabf20bcda00e7818038e2de0d52213de30704ce7986d5357e0ee" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Wallet recovery. The list of 12–24 words that can restore an entire wallet is called the ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "The human-readable backup that can regenerate your entire wallet — usually 12 or 24 ordinary words in a fixed order. Two words.",
        flagHash: "85900643d4625310d3837231ee08873598aa12556521c7ecbffb35c150728cff" }
    ] },

  { id: "w3-m2b", module: 4, title: "Custody & Addresses", category: "Digital Wallets",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Wallet transactions. The public string you share so others can send you crypto is your ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Share this to receive funds.",
        flagHash: "53631335bc552a01ecab2938272fec7e45811fc2432f18c8c117a99ef671534f" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Wallet types. A wallet kept offline for maximum security is called a ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Keys kept entirely offline, out of reach of remote attackers. Two words.",
        flagHash: "39863d225ef7f8c85a3e7e6ffed56f48ea5f5258b4bcdc7dd3ed641ae3ce71ed" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Public & private keys. The key derived from your private key that others use to verify your signatures is your ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Derived from the private key.",
        flagHash: "849913b08cbe7bcead3b745de10e0f6b59a19482dd7568299243304ccc68371a" }
    ] },

  { id: "w3-m2-keys", module: 4, title: "Share It or Hide It?", category: "Digital Wallets", type: "match", points: 150,
    intro: "Objective — Wallet security. Sort each item by whether it is safe to share. Tap the item, then tap the category.",
    pairs: [
      { left: "Public address", right: "Safe to share" },
      { left: "Private key", right: "Keep secret" },
      { left: "Seed phrase", right: "Keep secret" },
      { left: "Wallet's public key", right: "Safe to share" }
    ] },

  { id: "w3-m2-send", module: 4, title: "Send a Transaction", category: "Digital Wallets", type: "order", points: 150,
    intro: "Objective — Wallet transactions. Order the steps to send crypto from your wallet, first to last.",
    steps: [
      "Enter the recipient's address",
      "Enter the amount",
      "Sign with your private key",
      "Broadcast to the network",
      "Wait for confirmation on-chain"
    ] },

  { id: "w3-m2-wallets", module: 4, title: "Hot vs Cold Wallets", category: "Digital Wallets", type: "match", points: 150,
    intro: "Objective — Wallet types. Match each wallet to its trait. Tap the wallet, then tap the trait.",
    pairs: [
      { left: "Hot wallet", right: "Connected to the internet, convenient" },
      { left: "Cold wallet", right: "Kept offline, most secure" },
      { left: "Hardware wallet", right: "A physical cold-storage device" },
      { left: "Exchange wallet", right: "Custodial — the platform holds your keys" }
    ] },

  { id: "w3-m8-safe", module: 4, title: "Safe or Scam?", category: "Digital Wallets", type: "match", points: 150,
    intro: "Objective — Wallet security. Sort each action. Tap the action, then tap the label.",
    pairs: [
      { left: "Someone DMs asking for your seed phrase", right: "Scam" },
      { left: "Storing your seed phrase offline yourself", right: "Safe" },
      { left: "A site promising guaranteed 100x returns", right: "Scam" },
      { left: "Verifying a contract before you sign", right: "Safe" }
    ] },

  { id: "w3-m2-vocab", module: 4, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["wallet","private key","public key","seed phrase","address","cold wallet","hot wallet","custody","signature"],
    hardMode: "unscramble" },

  { id: "w3-wallet-connect", module: 4, title: "Associating & Connecting", category: "Digital Wallets",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Token association. On some networks a wallet must first ___ with a token before it is allowed to receive it.\n\nSubmit as flag{word} (lowercase).",
        hint: "Opt in to hold it.",
        flagHash: "7b542b06a9070ac516a2d5864e8b65fb60a02cb85b1181c8f124b677fb6f0e3f" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Connecting wallets. Approving an action with your private key, without ever revealing that key, produces a digital ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "You do this on paper too.",
        flagHash: "223e9978a3e86c5d5e7a0f59dde9606722740e63f3953b3394fcef94c2ac2a22" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Connecting wallets. A standing permission that lets a DApp spend tokens from your wallet, and should be revoked when unused, is an ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A spending limit you granted.",
        flagHash: "0c89a83816dd5a3742a0e484fedff8e0ababecbdc7358835b9d7ead507d3f63f" }
    ] },

  /* MODULE 5 — Blockchain Coding ──────────────────────────────────────────── */
  { id: "w3-m5a", module: 5, title: "Smart Contracts", category: "Blockchain Coding",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Smart contracts. Self-executing code stored on the blockchain that runs when conditions are met is a ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Self-executing code on-chain.",
        flagHash: "497a532123f0646fd636ac062b314d6d8ebb1119ad6daf013886f8ebe6895129" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Creating a token. The primary programming language for writing Ethereum smart contracts is ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Ethereum's main language.",
        flagHash: "f6a2f99e6fd251a7ed1a5103112bc5baf3f8c55ac563b96d08664f4c53a182db" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Smart contracts. The Ethereum Virtual Machine, which executes smart-contract code across the network, is abbreviated ___.\n\nSubmit as flag{abbreviation} (lowercase).",
        hint: "The runtime every Ethereum node uses to execute contract bytecode. Three letters.",
        flagHash: "c2e134b552f614af99897237babf59365f37de6d4c7b752995acafec2efe73dd" }
    ] },

  { id: "w3-m5b", module: 5, title: "Testing & Deploying", category: "Blockchain Coding",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Deploying code. Publishing a finished smart contract onto a blockchain network is to ___ it.\n\nSubmit as flag{word} (lowercase).",
        hint: "Publish to the network.",
        flagHash: "f1dc979fa097a6d23b52ab5e26dec82f113c9d11881dced5c3b466155e21d299" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Deploying code. The practice network where developers test contracts using valueless coins is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Practice network, fake coins.",
        flagHash: "b3b231446277bf8082cf1e95fe9778e72fdcaafaa880d6d8ed2a5fa2746563d8" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Smart contract risk. Once deployed, a smart contract's code generally cannot be changed. This property is ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Once a contract is on-chain its code can't be edited — you'd have to deploy a new one. One word for that property.",
        flagHash: "c49b5deed9c8d7547e3b7ce3d4507f6eb826c1faf33c328f87131a1709cc1fbf" }
    ] },

  { id: "w3-m5-contract", module: 5, title: "Smart Contract Concepts", category: "Blockchain Coding", type: "match", points: 150,
    intro: "Objective — Smart contracts. Match each term to its meaning. Tap a term, then tap its meaning.",
    pairs: [
      { left: "Smart contract", right: "Self-executing code on the chain" },
      { left: "Solidity", right: "Ethereum's contract language" },
      { left: "EVM", right: "Runs the contract code" },
      { left: "Deploy", right: "Publish the contract to the network" }
    ] },

  { id: "w3-m5-flow", module: 5, title: "Build & Deploy a Contract", category: "Blockchain Coding", type: "order", points: 150,
    intro: "Objective — Deploying code. Order the steps to build and deploy a smart contract, first to last.",
    steps: [
      "Write the contract in Solidity",
      "Compile the code",
      "Test it on a testnet",
      "Deploy it to the mainnet",
      "Users interact with it via a dApp"
    ] },

  { id: "w3-m5-trigger", module: 5, title: "What Triggers the Code?", category: "Blockchain Coding", type: "match", points: 150,
    intro: "Objective — Smart contracts. Match each concept to its role. Tap the concept, then tap its role.",
    pairs: [
      { left: "Condition met", right: "Causes the contract to execute" },
      { left: "Gas", right: "Pays for the computation" },
      { left: "Function call", right: "Runs a specific contract action" },
      { left: "Immutable", right: "Code can't change after deploy" }
    ] },

  { id: "w3-m5-vocab", module: 5, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["smart contract","solidity","evm","deploy","testnet","compile","function","immutable","code"],
    hardMode: "cipher" },

  { id: "w3-token-keys", module: 5, title: "Token Keys & Control", category: "Blockchain Coding",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Token keys. The key that allows new units of a token to be minted after it is created is the ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "It controls how many exist.",
        flagHash: "450b5ba88ea91bbc7357b3431d45883ffc44c05e32fdf3aa97a8b77021a087ad" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Token keys. The key that lets an administrator block one account from transferring a token is the ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "It puts an account on ice.",
        flagHash: "b3644cfbd4aa880c685cd029294f5c6e24e85b626970c5267897950ca945166b" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Token keys. The key that lets an administrator claw a token back out of a holder's wallet without their consent — the most controversial of the token keys — is the ___ ___. (two words, joined with an underscore)",
        hint: "It takes the token back.",
        flagHash: "01b08387b64587e052d7eca7b5f1995e30194490f42d1f7efcd1ac9066d0387e" }
    ] },

  /* MODULE 6 — DAOs ───────────────────────────────────────────────────────── */
  { id: "w3-m6b", module: 6, title: "DAOs & Governance", category: "DAOs",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — DAO fundamentals. A Decentralized Autonomous Organization, run by member votes and code instead of managers, is abbreviated ___.\n\nSubmit as flag{abbreviation} (lowercase).",
        hint: "Community-run organization.",
        flagHash: "b75d0ced6d6fcfb0ad15859eca1ace9e49b23261609291cf98b1ea23ce45af3d" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — DAO governance. The token that grants members voting power in a DAO is called a ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Holding it lets you vote on protocol proposals in a DAO. Two words.",
        flagHash: "31fa826724732b521120dcdad3cd62ebe84761024ee9b205840d0c74aa974f04" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — DAO decision-making. The process by which distributed nodes agree on the valid state of the ledger is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The mechanism by which distributed nodes agree on one valid version of the ledger. Proof of work and proof of stake are two approaches.",
        flagHash: "1cc4e8c190b1688a8dd844c8f732da7a9a08b324f36eb1afcf9a0fe3a202f7d4" }
    ] },

  { id: "w3-m6-vote", module: 6, title: "How a DAO Vote Works", category: "DAOs", type: "order", points: 150,
    intro: "Objective — DAO governance. Order how a DAO makes a decision, first to last.",
    steps: [
      "A member submits a proposal",
      "Token holders review it",
      "Members vote with governance tokens",
      "Votes are tallied on-chain",
      "The winning outcome executes automatically"
    ] },

  { id: "w3-m6-vocab", module: 6, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["dapp","dao","defi","oracle","governance","voting","proposal","protocol","lending"],
    hardMode: "wordsearch" },

  { id: "w3-dao-apply", module: 6, title: "Proposals & Quorum", category: "DAOs",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — DAO fundamentals. The rule set that runs a DAO is enforced by code rather than managers — it lives in a smart ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Code that executes itself.",
        flagHash: "86f0e6b100c80f230ec8664619cdc3e89df1184a63364eec30b41d2b22977275" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — DAO governance. A formal suggestion a member submits for the whole DAO to vote on is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "You put it forward.",
        flagHash: "ab2e3b1abd16fc78a148130aebf6c0f862c09c02ff3a0e0b38b4d745232aee51" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — DAO governance. The minimum participation required before a DAO vote counts as valid is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Enough people showed up.",
        flagHash: "163ca7ccb1cb986a15834093c6cad5e93ed34d6506f73d78063517dda80b8ed5" }
    ] },

  { id: "w3-dao-ethics", module: 6, title: "Power, Law & Liability", category: "DAOs",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — DAO ethics. When one member holds enough governance tokens to decide every vote alone, voting power has become ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The thing DAOs try to avoid.",
        flagHash: "a33cb01ce099dce15be3b80948e56a9110c4b00781d19ec0e4127b71fb5fc781" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — DAO legal considerations. Because most DAOs are not registered companies, members face uncertainty about personal legal ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Who pays if it goes wrong?",
        flagHash: "1c2e0d48dc138916384bedd521c41cb3e7f0c4d7f4e0d8181df9971e69d484b2" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — DAO legal considerations. Some U.S. states now let a DAO register as a limited liability company, abbreviated ___.\n\nSubmit as flag{abbreviation} (lowercase).",
        hint: "Three letters.",
        flagHash: "bd9b119fdb31b038b036e009527cb9c953fb5430f7128e3070d66ce01da9563b" }
    ] },

  { id: "w3-dao-tradeoffs", module: 6, title: "DAO: Upside or Problem?", category: "DAOs", type: "match", points: 150,
    intro: "Objective — DAO benefits & challenges. Sort each trait of a DAO. Tap the trait, then tap the label.",
    pairs: [
      { left: "Anyone can read every decision", right: "Benefit" },
      { left: "Votes can be slow to reach quorum", right: "Challenge" },
      { left: "No manager can overrule the members", right: "Benefit" },
      { left: "Whoever buys the most tokens gains the most say", right: "Challenge" },
      { left: "Rules run automatically as written", right: "Benefit" },
      { left: "A bug in the code is a bug in the rules", right: "Challenge" }
    ] },

  { id: "w3-dao-real", module: 6, title: "What Is This DAO For?", category: "DAOs", type: "match", points: 150,
    intro: "Objective — DAO applications. Match each real-world DAO to what it does. Tap the DAO, then tap its purpose.",
    pairs: [
      { left: "Protocol DAO", right: "Governs how a DeFi platform's rules change" },
      { left: "Grants DAO", right: "Votes on funding proposals from builders" },
      { left: "Collector DAO", right: "Pools member money to buy assets together" },
      { left: "Social DAO", right: "Runs a member community and its shared treasury" }
    ] },

  /* MODULE 7 — DApps ──────────────────────────────────────────────────────── */
  { id: "w3-m6a", module: 7, title: "Decentralized Apps", category: "DApps",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — DApp fundamentals. An application whose backend runs on a blockchain via smart contracts is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Decentralized application.",
        flagHash: "80f657643695ce0d2a24cc8be255ca44c369e4316d597a42653e792dc967f761" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — DApp use cases. Financial services (lending, trading) built on blockchain without traditional banks are called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Lending, trading, and borrowing built on smart contracts instead of banks. Four letters.",
        flagHash: "0e7ce4039ea026fa071c6f549c97fc636c28b11439c6ac02856020d0378c40d0" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — DApp architecture. A service that feeds real-world data to a smart contract is called a(n) ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Feeds real-world data on-chain.",
        flagHash: "9afb20edcb5db273f98641cf855adaa62a6ec436c3688c825a73bdf46dfefbdd" }
    ] },

  { id: "w3-m6-match", module: 7, title: "DApp & DAO Terms", category: "DApps", type: "match", points: 150,
    intro: "Objective — DApp fundamentals. Match each term to its meaning. Tap a term, then tap its meaning.",
    pairs: [
      { left: "dApp", right: "App with a blockchain backend" },
      { left: "DeFi", right: "Finance without traditional banks" },
      { left: "DAO", right: "Community run by votes and code" },
      { left: "Oracle", right: "Feeds real-world data on-chain" }
    ] },

  { id: "w3-m6-defi", module: 7, title: "TradFi vs DeFi", category: "DApps", type: "match", points: 150,
    intro: "Objective — DeFi & tokenization. Sort each trait. Tap the trait, then tap the category.",
    pairs: [
      { left: "A bank approves your loan", right: "Traditional Finance" },
      { left: "A smart contract lends automatically", right: "DeFi" },
      { left: "A central company holds funds", right: "Traditional Finance" },
      { left: "Code and collateral replace the middleman", right: "DeFi" }
    ] },

  { id: "w3-dapp-traits", module: 7, title: "Anatomy of a DApp", category: "DApps",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — DApp characteristics. The part of a DApp that users actually see and click in the browser is the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Opposite of backend.",
        flagHash: "cd79bb5b19ff875ebdf3b084d59c7b52b9cb61e4a667106da7b18eedd601646e" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — DApp architecture. Unlike a Web 2.0 app, a DApp has no single ___ that one company can switch off.\n\nSubmit as flag{word} (lowercase).",
        hint: "Where centralized apps live.",
        flagHash: "cb69d6bc363a9bbe3c99e1d657cebdfe9349cdf02e28dc74db6eed9e62c172c0" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — DApp economics. Turning a real asset or right into a tradable token on a blockchain is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Make it a token.",
        flagHash: "50b48427e8d463f8708e9cca41428b28096bd874383a1ca9f806761962436e46" }
    ] },

  { id: "w3-dapp-risk", module: 7, title: "Security & Jurisdiction", category: "DApps",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — DApp security. A review of a smart contract's code by outside experts before launch is called an ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Accountants do these too.",
        flagHash: "de298d79fd1cf82ff02e6e7764b36cc280d8e7dbde822b187a46ef8cbab47367" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — DApp security. An attack that re-enters a contract's function repeatedly before it updates its balance is a ___ attack.\n\nSubmit as flag{word} (lowercase).",
        hint: "It goes back in.",
        flagHash: "686976d7f95b7b49a145f8c5208a035ebec5d0926b9e65132b52ac7ae466ca28" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — DApp legal considerations. Because a DApp runs everywhere at once, the hardest legal question is whose law applies — an issue of ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Which court has authority.",
        flagHash: "e0edc02d0e841a72dcf1cdfa56a53735450a12aa5133093b082d150806adcf1b" }
    ] },

  { id: "w3-dapp-vs", module: 7, title: "DApp or Traditional App?", category: "DApps", type: "match", points: 150,
    intro: "Objective — DApps vs centralized apps. Sort each trait. Tap the trait, then tap the category.",
    pairs: [
      { left: "One company controls the database", right: "Traditional app" },
      { left: "Backend logic runs in smart contracts", right: "DApp" },
      { left: "Can be taken offline by its owner", right: "Traditional app" },
      { left: "Users sign actions with their own keys", right: "DApp" },
      { left: "Password reset by support staff", right: "Traditional app" },
      { left: "Code is public and verifiable", right: "DApp" }
    ] },

  { id: "w3-dapp-vocab", module: 7, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["dapp","smart contract","frontend","oracle","defi","tokenization","audit","jurisdiction","reentrancy","gas"],
    hardMode: "rapid" },

  /* MODULE 8 — Applied Application ────────────────────────────────────────── */
  { id: "w3-m7a", module: 8, title: "Project Planning", category: "Class Project",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Applied problem solving. The document that explains a Web 3.0 project's purpose, technology, and tokenomics is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Explains the project.",
        flagHash: "b6fdfe6dbbe5ff579a27163c4ba09589d066584358796edbd6103fc308b9abcc" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Tokenomics. The specific real-world problem your project solves is its ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "The real problem it solves.",
        flagHash: "05c53fb721bdc68780d3a36933f87293faeb07172fc9e7741e8f688e5c136b1c" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Tokenomics. The design of a token's supply, distribution, and incentives is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Token supply & incentives.",
        flagHash: "6e50edc26f743932c182177ea8a6320d54fb51497030b70ed8a9a02af706b6a0" }
    ] },

  { id: "w3-m7b", module: 8, title: "Build & Present", category: "Class Project",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Token/NFT as solution. An early working model of your project used to test the idea is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "An early working version.",
        flagHash: "e7a456f0cf0705f7d03206c9440f6eb224bf0a546f110b00784013ef9eb31297" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Web 3 principles. Spreading control across many participants instead of one authority is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The core Web3 property: no single party controls the network or can shut it down.",
        flagHash: "4cdeb32a366f7d988d5200cab0cb6b93234de4ccbfb75b0a733a86627f68d7f3" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Collaborative strategy. The simplest version of a product that still delivers value to users is the ___ ___ ___.\n\nSubmit as flag{three words} (lowercase).",
        hint: "The smallest version of a product that still delivers value and can be tested with real users. Three words.",
        flagHash: "f6da6caa455522fc5d0ca34b68682f23e25b493587d11f198ef8cded22d0a50a" }
    ] },

  { id: "w3-m7-plan", module: 8, title: "Plan Your Web3 Project", category: "Class Project", type: "order", points: 150,
    intro: "Objective — Applied problem solving. Order the stages of planning a Web 3.0 project, first to last.",
    steps: [
      "Identify a problem to solve",
      "Define the use case",
      "Design the tokenomics",
      "Build a prototype",
      "Present the whitepaper"
    ] },

  { id: "w3-m7-match", module: 8, title: "Match the Project Piece", category: "Class Project", type: "match", points: 150,
    intro: "Objective — Applied problem solving. Match each deliverable to what it is. Tap a piece, then tap its meaning.",
    pairs: [
      { left: "Whitepaper", right: "Explains purpose and tech" },
      { left: "Tokenomics", right: "Supply and incentive design" },
      { left: "Prototype", right: "Early working version" },
      { left: "Use case", right: "The problem it solves" }
    ] },

  { id: "w3-m7-good", module: 8, title: "Strong or Weak Idea?", category: "Class Project", type: "match", points: 150,
    intro: "Objective — Collaborative strategy. Sort each project idea. Tap the idea, then tap the label.",
    pairs: [
      { left: "Solves a real problem decentralization helps", right: "Strong" },
      { left: "Adds blockchain for no clear reason", right: "Weak" },
      { left: "Has clear users and tokenomics", right: "Strong" },
      { left: "Copies another project with no improvement", right: "Weak" }
    ] },

  { id: "w3-m7-vocab", module: 8, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["whitepaper","tokenomics","prototype","use case","project","mvp","decentralization","roadmap"],
    hardMode: "rapid" }

  ]
};



/* ============================================================
   PROOF OF WORK CHALLENGES (Web 3.0) — guide ORACLE, mentor mode.
   2 leveled text flags + 3 interactive captures + vocab per module.
   Objectives are placeholders pending the uploaded course objectives;
   remap the 'Objective — ...' lines once those arrive.
   ============================================================ */


window.COURSE_CONFIG.web3.ctf.moduleFrameworks = {
  1: { district: { name: "PA Standards", bigIdeas: [1,4], standards: ["3A.DA.10","3B.IC.27","3A.IC.24","3A.IC.30"] }, ap: null },
  2: { district: { name: "PA Standards", bigIdeas: [4,5], standards: ["3B.IC.27"] }, ap: null },
  3: { district: { name: "PA Standards", bigIdeas: [5], standards: ["3B.IC.27"] }, ap: null },
  4: { district: { name: "PA Standards", bigIdeas: [5], standards: ["3A.NI.07"] }, ap: null },
  5: { district: { name: "PA Standards", bigIdeas: [3], standards: ["3B.AP.22"] }, ap: null },
  6: { district: { name: "PA Standards", bigIdeas: [5], standards: ["3B.IC.28"] }, ap: null },
  7: { district: { name: "PA Standards", bigIdeas: [5], standards: ["3B.IC.27"] }, ap: null },
  8: { district: { name: "PA Standards", bigIdeas: [5], standards: ["3B.IC.28"] }, ap: null },
  9: { district: { name: "PA Standards", bigIdeas: [1,3,5], standards: ["3B.AP.22","3B.AP.20","3B.AP.10"] }, ap: null }
};


window.COURSE_CONFIG.web3.ctf.moduleObjectives = {
  1: ["Discuss the evolution of the web (Web 1.0 to Web 3.0).","Explore the core principles of Web 3, such as decentralization, privacy, and user ownership.","Compare and contrast centralization and decentralization.","Explain fundamentals of blockchain, including blocks, cryptography, and consensus mechanisms.","Compare and contrast proof of work vs. proof of stake.","Understand the role of blockchain in building decentralized applications (DApps).","Investigate real-world use cases of blockchain technology, such as cryptocurrencies, smart contracts, and supply chain management."],
  2: ["Introduce cryptocurrencies: coins & tokens.","Compare and contrast networks and their native tokens.","Explain what \"gas\" is for a transaction.","Explain the purpose of a cryptocurrency exchange.","Explain the impact of cryptocurrency on traditional finance (decentralized finance / decentralized exchanges).","Research a project that utilizes a cryptocurrency token and discuss the tokenomics of the project.","Give examples of smart contracts and discuss their future use."],
  3: ["Compare and contrast NFTs to fungible tokens.","Explain the concept of NFTs as unique digital assets that can represent ownership or proof of authenticity of a digital or physical item.","Discuss the characteristics and benefits of NFTs, such as indivisibility, scarcity, and verifiability.","State real-world examples and use cases of NFTs, including digital art, collectibles, gaming assets, and intellectual property rights.","Present a range of real-world use cases and applications of Web 3 and NFTs.","Discuss how NFTs can enable new forms of creativity, ownership, and monetization in various industries.","Explore the potential impact of NFTs on the art market, gaming industry, virtual real estate, identity verification, fractional ownership, gamification, and more.","Recognize legal and regulatory considerations related to NFTs, such as taxation and compliance."],
  4: ["Compare and contrast software wallets, hardware wallets, and web wallets.","Create a digital wallet.","Recover a lost digital wallet using a word phrase / secret key.","Discuss advantages, disadvantages, and challenges of digital wallets.","Distinguish between private and public keys.","Discuss best practices and safety/security concerns regarding digital wallets.","Explore a digital wallet transaction.","Add various types of assets to the wallet (various tokens) and discuss the benefit of token association.","Discuss connecting wallets to platforms and signing contracts."],
  5: ["Create a token.","Determine and code characteristics of a token.","Send associated tokens using code.","Explore characteristics such as admin keys, supply keys, and freeze keys.","Freeze a token in a wallet.","Create an NFT and define metadata for the NFT."],
  6: ["Define and explain the concept of DAOs.","Analyze the benefits and challenges of DAOs.","Evaluate real-world applications of DAOs.","Examine the governance mechanisms of DAOs.","Explore the ethical considerations in DAOs.","Understand collaborative decision-making in DAOs.","Investigate legal and regulatory considerations in DAOs."],
  7: ["Define and explain the concept of DApps.","Identify the key characteristics and components of DApps.","Explore the benefits and limitations of DApps compared to traditional centralized applications.","Explore different types and examples of DApps in various industries.","Understand the underlying blockchain technology and its role in supporting DApps.","Evaluate the security considerations and challenges associated with DApps.","Investigate the economic models and incentives used in DApps, such as tokenization and decentralized finance (DeFi).","Explore the legal and regulatory considerations surrounding DApps, including jurisdictional issues and compliance requirements.","Analyze the impact of DApps on traditional business models and industries.","Collaborate with peers to discuss and propose potential use cases for DApps in solving real-world problems.","Present and communicate ideas, findings, and projects related to DApps effectively."],
  8: ["Explore the legal challenges and implications of Web 3.0 technologies.","Examine the regulatory frameworks and legal considerations surrounding decentralized applications and blockchain technology.","Analyze the legal implications of tokenization, initial coin offerings (ICOs), and decentralized finance (DeFi) platforms.","Analyze the ethical dilemmas and implications of Web 3.0.","Evaluate the impact of decentralized systems on trust, governance, and transparency.","Discuss the ethical implications of data privacy, ownership, and control in the context of Web 3.0.","Examine the potential for algorithmic bias and socio-economic inequality in decentralized environments.","Evaluate existing legal and ethical frameworks for Web 3.0.","Develop strategies for responsible adoption of Web 3.0 technologies.","Identify best practices for user education and informed consent in decentralized systems.","Discuss the importance of user-centric design and privacy-enhancing technologies in Web 3.0 applications."],
  9: ["Implement previously learned content to solve a localized problem using Web 3 technology.","Work collaboratively to develop strategies involving Web 3 concepts to solve a problem.","Create a token/NFT for use as a strategy in solving a problem."]
};


window.COURSE_CONFIG.web3.ctf.bossQuestions = [{"module":1,"topic":"M1","diff":"Easy","kind":"text","prompt":"A shared, append-only record of transactions in linked blocks is a ___. (one word)","answer":"blockchain"},{"module":1,"topic":"M1","diff":"Medium","kind":"mc","prompt":"Why can't someone quietly edit a transaction in an old block?","choices":["Changing it breaks every following block's hash","Blocks aren't stored anywhere","Only banks can edit blocks","Hashes are random and ignored"],"answer":"Changing it breaks every following block's hash"},{"module":1,"topic":"M1","diff":"Hard","kind":"text","prompt":"The energy-efficient consensus where validators lock up coins is proof of ___. (one word)","answer":"stake"},{"module":2,"topic":"M2","diff":"Easy","kind":"text","prompt":"The fee paid to run a transaction on Ethereum is called ___. (one word)","answer":"gas"},{"module":2,"topic":"M2","diff":"Medium","kind":"mc","prompt":"A token pegged to the US dollar to stay at a steady value is a:","choices":["Stablecoin","NFT","Governance token","Meme coin"],"answer":"Stablecoin"},{"module":3,"topic":"M3","diff":"Easy","kind":"text","prompt":"Publishing a new NFT onto the blockchain is called ___. (one word)","answer":"minting"},{"module":3,"topic":"M3","diff":"Medium","kind":"mc","prompt":"You buy an NFT of an image. What do you definitely own?","choices":["A unique on-chain token proving ownership","The full copyright to the art","The only copy of the image","The website it was sold on"],"answer":"A unique on-chain token proving ownership"},{"module":3,"diff":"Hard","kind":"text","prompt":"Buying an NFT of an artwork does not transfer the artist's ___ unless stated. (one word)","answer":"copyright","topic":"M3"},{"module":4,"topic":"M4","diff":"Easy","kind":"mc","prompt":"Which of these should you NEVER share with anyone?","choices":["Your seed phrase","Your public address","Your username","Your wallet app name"],"answer":"Your seed phrase"},{"module":4,"topic":"M4","diff":"Medium","kind":"text","prompt":"A wallet kept completely offline for security is called a ___ wallet. (one word)","answer":"cold"},{"module":4,"topic":"M4","diff":"Medium","kind":"mc","prompt":"A stranger promises to double any crypto you send them first. This is:","choices":["A scam","A gas fee","Staking","A smart contract"],"answer":"A scam"},{"module":5,"topic":"M5","diff":"Easy","kind":"text","prompt":"The main programming language for Ethereum smart contracts is ___. (one word)","answer":"solidity"},{"module":5,"topic":"M5","diff":"Medium","kind":"mc","prompt":"Why test a smart contract on a testnet before mainnet?","choices":["Deployed code usually can't be changed, so bugs are costly","Testnets are faster than reading the code","Mainnet doesn't allow contracts","It skips the gas fee forever"],"answer":"Deployed code usually can't be changed, so bugs are costly"},{"module":5,"diff":"Hard","kind":"text","prompt":"Setting a token's keys to null so it can never be changed makes it ___. (one word)","answer":"immutable","topic":"M5"},{"module":6,"topic":"M6","diff":"Easy","kind":"text","prompt":"A community-run organization governed by member votes and code is a ___. (abbreviation)","answer":"dao"},{"module":6,"diff":"Medium","kind":"mc","prompt":"A DAO proposal passes with 3 yes votes out of 500 members. What went wrong?","choices":["Quorum was never reached","The vote was illegal","Smart contracts cannot count votes","Nothing — majority is majority"],"answer":"Quorum was never reached","topic":"M6"},{"module":6,"diff":"Hard","kind":"text","prompt":"One member buys enough governance tokens to win every vote alone. Power has become ___. (one word)","answer":"centralized","topic":"M6"},{"module":7,"topic":"M7","diff":"Medium","kind":"mc","prompt":"A smart contract needs the current price of gold. What provides it?","choices":["An oracle","A wallet","A seed phrase","A testnet"],"answer":"An oracle"},{"module":7,"diff":"Medium","kind":"mc","prompt":"What can a DApp do that a traditional app cannot?","choices":["Keep running even if its creators disappear","Store data","Show a web page","Charge users money"],"answer":"Keep running even if its creators disappear","topic":"M7"},{"module":7,"diff":"Hard","kind":"text","prompt":"Outside experts reviewing contract code before launch perform an ___. (one word)","answer":"audit","topic":"M7"},{"module":8,"topic":"M8","diff":"Medium","kind":"mc","prompt":"Which is the STRONGEST Web3 project idea?","choices":["Solves a real problem that benefits from decentralization","Adds a token to an app just to raise money","Copies an existing coin exactly","Uses blockchain with no clear reason"],"answer":"Solves a real problem that benefits from decentralization"},{"module":8,"diff":"Hard","kind":"text","prompt":"The simplest version of your project that still delivers real value is the ___ ___ ___. (three words)","answer":"minimum viable product","topic":"M8"}];
