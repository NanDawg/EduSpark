import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const subjects = [
    { name: "Bahasa Indonesia", slug: "bahasa-indonesia" },
    { name: "Matematika", slug: "matematika" },
    { name: "IPAS", slug: "ipas" },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: {},
      create: subject,
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { username: "siswa1" },
    update: {},
    create: {
      username: "siswa1",
      passwordHash,
      name: "Budi",
      classLevel: 3,
    },
  });

  const badges = [
    {
      id: "first_quiz",
      name: "Langkah Pertama",
      description: "Selesaikan kuis pertamamu.",
      icon: "clipboard-check",
    },
    {
      id: "perfect_score",
      name: "Nilai Sempurna",
      description: "Dapatkan nilai 100 pada satu kuis.",
      icon: "star",
    },
    {
      id: "streak_3",
      name: "Rajin Belajar",
      description: "Dapatkan XP 3 hari berturut-turut.",
      icon: "flame",
    },
    {
      id: "lesson_done",
      name: "Bintang Pembaca",
      description: "Tandai materi pertamamu selesai.",
      icon: "book-open",
    },
    {
      id: "xp_100",
      name: "Pemburu XP",
      description: "Kumpulkan total 100 XP.",
      icon: "trophy",
    },
    {
      id: "path_complete",
      name: "Penjelajah",
      description: "Selesaikan satu jalur belajar sampai akhir.",
      icon: "map",
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: {},
      create: badge,
    });
  }

  const learningPaths = [
    {
      slug: "matematika",
      title: "Matematika",
      description: "Dari bilangan sampai data, langkah demi langkah.",
      nodes: [
        {
          chapter: 1,
          title: "Bilangan sampai 100.000",
          objective: "Mengenal dan menulis bilangan sampai 100.000.",
          topic: "Bilangan hingga 100.000",
        },
        {
          chapter: 1,
          title: "Penjumlahan & Pengurangan",
          objective: "Menjumlah dan mengurangkan bilangan besar dengan tepat.",
          topic: "Penjumlahan dan pengurangan bilangan besar",
        },
        {
          chapter: 2,
          title: "Perkalian & Pembagian",
          objective: "Melakukan perkalian dan pembagian bilangan.",
          topic: "Perkalian dan pembagian",
        },
        {
          chapter: 2,
          title: "Pengukuran Panjang",
          objective: "Mengukur panjang dan mengubah satuan panjang.",
          topic: "Pengukuran panjang",
        },
        {
          chapter: 3,
          title: "Waktu dan Suhu",
          objective: "Membaca waktu dan mengukur suhu sehari-hari.",
          topic: "Waktu dan suhu",
        },
        {
          chapter: 3,
          title: "Bangun Datar",
          objective: "Mengenal sisi, sudut, dan persegi panjang.",
          topic: "Bangun datar",
        },
        {
          chapter: 4,
          title: "Membaca Data",
          objective: "Membaca diagram dan tabel sederhana.",
          topic: "Membaca data dan diagram",
        },
      ],
    },
    {
      slug: "bahasa-indonesia",
      title: "Bahasa Indonesia",
      description: "Membaca, memahami, lalu menulis sendiri.",
      nodes: [
        {
          chapter: 1,
          title: "Inti Gagasan",
          objective: "Menemukan inti gagasan sebuah teks.",
          topic: "Inti gagasan teks",
        },
        {
          chapter: 1,
          title: "Teks Narasi",
          objective: "Mengenali cerita dan urutan peristiwanya.",
          topic: "Teks narasi",
        },
        {
          chapter: 2,
          title: "Teks Deskripsi",
          objective: "Menggambarkan benda dan tempat dengan kata-kata.",
          topic: "Teks deskripsi",
        },
        {
          chapter: 2,
          title: "Urutan Cerita",
          objective: "Menyusun peristiwa menurut urutan yang benar.",
          topic: "Urutan cerita",
        },
        {
          chapter: 3,
          title: "Pantun dan Puisi",
          objective: "Mengenal pantun dan puisi anak.",
          topic: "Pantun dan puisi",
        },
        {
          chapter: 3,
          title: "Tanda Baca",
          objective: "Menggunakan tanda baca saat menulis.",
          topic: "Tanda baca",
        },
        {
          chapter: 4,
          title: "Surat untuk Sahabat",
          objective: "Menulis surat pribadi sederhana.",
          topic: "Menulis surat pribadi",
        },
      ],
    },
    {
      slug: "ipas",
      title: "IPAS",
      description: "Sains di sekitar kita, satu misi setiap kali.",
      nodes: [
        {
          chapter: 1,
          title: "Bagian Tumbuhan",
          objective: "Mengenal bagian-bagian tumbuhan fungsinya.",
          topic: "Bagian-bagian tumbuhan",
        },
        {
          chapter: 1,
          title: "Hewan dan Habitat",
          objective: "Menghubungkan hewan dengan tempat hidupnya.",
          topic: "Hewan dan habitatnya",
        },
        {
          chapter: 2,
          title: "Rantai Makanan",
          objective: "Menyusun rantai makanan sederhana.",
          topic: "Rantai makanan",
        },
        {
          chapter: 2,
          title: "Siklus Air",
          objective: "Menjelaskan perjalanan air di alam.",
          topic: "Siklus air",
        },
        {
          chapter: 3,
          title: "Gerak Benda",
          objective: "Membedakan benda bergerak dan diam.",
          topic: "Gerak benda",
        },
        {
          chapter: 3,
          title: "Suara dan Cahaya",
          objective: "Menjelaskan asal suara dan cahaya.",
          topic: "Suara dan cahaya",
        },
        {
          chapter: 4,
          title: "Jaga Lingkungan",
          objective: "Menjelaskan cara menjaga lingkungan sekolah.",
          topic: "Menjaga lingkungan",
        },
      ],
    },
  ];

  for (const pathSeed of learningPaths) {
    const subject = await prisma.subject.findUnique({
      where: { slug: pathSeed.slug },
    });
    if (!subject) throw new Error(`Subject tidak ditemukan: ${pathSeed.slug}`);

    const path = await prisma.learningPath.upsert({
      where: {
        subjectId_classLevel_order: {
          subjectId: subject.id,
          classLevel: 3,
          order: 0,
        },
      },
      update: { title: pathSeed.title, description: pathSeed.description },
      create: {
        subjectId: subject.id,
        classLevel: 3,
        title: pathSeed.title,
        description: pathSeed.description,
        order: 0,
      },
    });

    for (const [index, node] of pathSeed.nodes.entries()) {
      await prisma.lessonNode.upsert({
        where: { pathId_order: { pathId: path.id, order: index } },
        update: {
          chapter: node.chapter,
          title: node.title,
          objective: node.objective,
          topic: node.topic,
        },
        create: {
          pathId: path.id,
          order: index,
          chapter: node.chapter,
          title: node.title,
          objective: node.objective,
          topic: node.topic,
        },
      });
    }
  }

  console.log(
    "Seed selesai: 3 mata pelajaran + akun demo siswa1/password123 + 6 badge + 3 jalur belajar (kelas 3, 21 simpul)"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
