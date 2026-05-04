const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const temporaryPlayers = [
  {
    name: "Lucky",
    email: "lucky@peserta.local",
    nickname: "SilentKill",
    mlId: "67458566",
    rank: "Legend",
    mainRole: "EXP_Lane",
    secondRole: "Jungler"
  },
  {
    name: "Ujang",
    email: "ujang@peserta.local",
    nickname: "Kovalski",
    mlId: "68392155",
    rank: "Legend",
    mainRole: "Roamer",
    secondRole: "Gold_Lane"
  },
  {
    name: "Ramdan",
    email: "ramdan@peserta.local",
    nickname: "ARISEDANTE.",
    mlId: "55196663",
    rank: "Mythic",
    mainRole: "Jungler",
    secondRole: "Gold_Lane"
  },
  {
    name: "Okky",
    email: "okky@peserta.local",
    nickname: "BANGZ•Bie",
    mlId: "55120108",
    rank: "Mythic",
    mainRole: "Gold_Lane",
    secondRole: "Roamer"
  },
  {
    name: "Iwong",
    email: "iwong@peserta.local",
    nickname: "Wanzhead",
    mlId: "158353311",
    rank: "Epic",
    mainRole: "Roamer",
    secondRole: "Gold_Lane"
  },
  {
    name: "Pipic",
    email: "pipic@peserta.local",
    nickname: "Aqua Vites",
    mlId: "Belum diisi",
    rank: "Legend",
    mainRole: "Mid_Lane",
    secondRole: "Gold_Lane"
  },
  {
    name: "Bimo",
    email: "bimo@peserta.local",
    nickname: "Poss1bility",
    mlId: "28473195 (2038)",
    rank: "Legend",
    mainRole: "Mid_Lane",
    secondRole: "EXP_Lane"
  },
  {
    name: "Kanjeng Dimas",
    email: "kanjeng.dimas@peserta.local",
    nickname: "Icarus.Falls",
    mlId: "210586326",
    rank: "Legend",
    mainRole: "Roamer",
    secondRole: "Mid_Lane"
  },
  {
    name: "Acep",
    email: "acep@peserta.local",
    nickname: "Amayu",
    mlId: "1290948778",
    rank: "Legend",
    mainRole: "Gold_Lane",
    secondRole: "Mid_Lane"
  },
  {
    name: "Adam x Ica",
    email: "adam.ica@peserta.local",
    nickname: "AlegrE",
    mlId: "Belum diisi",
    rank: "Epic",
    mainRole: "EXP_Lane",
    secondRole: "EXP_Lane"
  },
  {
    name: "Razzan",
    email: "razzan@peserta.local",
    nickname: "Z A N N",
    mlId: "Belum diisi",
    rank: "Legend",
    mainRole: "Mid_Lane",
    secondRole: "Gold_Lane"
  },
  {
    name: "Gagah",
    email: "gagah@peserta.local",
    nickname: "bonazkamizuka",
    mlId: "189919847",
    rank: "Mythic",
    mainRole: "EXP_Lane",
    secondRole: "Roamer"
  },
  {
    name: "Antosyah",
    email: "antosyah@peserta.local",
    nickname: "CIAMIS<3",
    mlId: "194472828 (9010)",
    rank: "Legend",
    mainRole: "EXP_Lane",
    secondRole: "Roamer"
  },
  {
    name: "A' Fey",
    email: "afey@peserta.local",
    nickname: "AKU DAN 4 ORANG PEA",
    mlId: "102449613 (2526)",
    rank: "Legend",
    mainRole: "Roamer",
    secondRole: "Gold_Lane"
  },
  {
    name: "Asep Eful",
    email: "asep.eful@peserta.local",
    nickname: "Burung Indah",
    mlId: "891017717 (12538)",
    rank: "Legend",
    mainRole: "Gold_Lane",
    secondRole: "Mid_Lane"
  },
  {
    name: "Ifan Ramdani",
    email: "ifan.ramdani@peserta.local",
    nickname: "NOOB SEKALI",
    mlId: "945338412 (12746)",
    rank: "Legend",
    mainRole: "Mid_Lane",
    secondRole: "Jungler"
  }
];

async function main() {
  const adminPassword = await bcrypt.hash("admin12345", 10);
  const playerPassword = await bcrypt.hash("player12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@diskominfo.local" },
    update: {
      name: "Admin Diskominfo",
      password: adminPassword,
      role: "admin"
    },
    create: {
      name: "Admin Diskominfo",
      email: "admin@diskominfo.local",
      password: adminPassword,
      role: "admin"
    }
  });

  await prisma.season.upsert({
    where: { id: "season-internal-2026" },
    update: {},
    create: {
      id: "season-internal-2026",
      name: "Season Internal 2026",
      status: "registration"
    }
  });

  for (const player of temporaryPlayers) {
    await prisma.user.upsert({
      where: { email: player.email },
      update: {
        name: player.name,
        password: playerPassword,
        role: "player",
        player: {
          upsert: {
            update: {
              nickname: player.nickname,
              mlId: player.mlId,
              phone: "-",
              unit: "Peserta sementara",
              rank: player.rank,
              mainRole: player.mainRole,
              secondRole: player.secondRole,
              verified: true
            },
            create: {
              nickname: player.nickname,
              mlId: player.mlId,
              phone: "-",
              unit: "Peserta sementara",
              rank: player.rank,
              mainRole: player.mainRole,
              secondRole: player.secondRole,
              verified: true
            }
          }
        }
      },
      create: {
        name: player.name,
        email: player.email,
        password: playerPassword,
        role: "player",
        player: {
          create: {
            nickname: player.nickname,
            mlId: player.mlId,
            phone: "-",
            unit: "Peserta sementara",
            rank: player.rank,
            mainRole: player.mainRole,
            secondRole: player.secondRole,
            verified: true
          }
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
