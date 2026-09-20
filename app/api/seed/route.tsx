import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const MOCK_BOOKS = [
  { id: '1', title: 'The History of Islamic Thought', shelf: 'Shelf 297', publisher: 'Darul Huda Press', author: 'Dr. Yasin Hamid' },
  { id: '2', title: 'Classical Jurisprudence Foundations', shelf: 'Shelf 342', publisher: 'Al-Resalah Publishers', author: 'Sheikh Zainuddin' },
  { id: '3', title: 'Modern Logic & Epistemology', shelf: 'Shelf 104', publisher: 'Academic World Books', author: 'Prof. Malik Al-Ameen' },
  { id: '4', title: 'Principles of Tafseer Studies', shelf: 'Shelf 211', publisher: 'Maktaba Al-Bushra', author: 'Dr. Abdul Rahman' },
  { id: '5', title: 'Hadith Methodology and Criticism', shelf: 'Shelf 225', publisher: 'Islamic Book Trust', author: 'Imam Al-Muhaddith' },
  { id: '6', title: 'Ethics in Governance and Society', shelf: 'Shelf 320', publisher: 'Kube Publishing', author: 'Dr. Tariq Ramadan' },
  { id: '7', title: 'The Golden Age of Andalusian Science', shelf: 'Shelf 509', publisher: 'Cordoba Heritage House', author: 'Prof. Al-Hassan' },
  { id: '8', title: 'Comparative Legal Maxims', shelf: 'Shelf 345', publisher: 'Dar Ibn Hazm', author: 'Sheikh Ahmed Zarqa' },
  { id: '9', title: 'Spiritual Purification in Practice', shelf: 'Shelf 299', publisher: 'White Thread Press', author: 'Imam Al-Ghazali Study Group' },
  { id: '10', title: 'Arabic Syntax and Morphology', shelf: 'Shelf 492', publisher: 'Al-Maarif Library', author: 'Ibn Hisham Al-Ansari' },
  { id: '11', title: 'Economic Systems in History', shelf: 'Shelf 330', publisher: 'Islamic Economics Institute', author: 'Dr. Monzer Kahf' },
  { id: '12', title: 'Prophetic Biography: Deep Lessons', shelf: 'Shelf 298', publisher: 'Darussalam', author: 'Sheikh Safi-ur-Rahman' },
  { id: '13', title: 'Philosophy of Science in Islam', shelf: 'Shelf 180', publisher: 'ISTAC Publications', author: 'Dr. Naquib Al-Attas' },
  { id: '14', title: 'Rhetoric and Eloquence in Verse', shelf: 'Shelf 810', publisher: 'Adab Press', author: 'Al-Jahiz Scholars' },
  { id: '15', title: 'Constitutional Order in Early Islam', shelf: 'Shelf 340', publisher: 'Other Press', author: 'Dr. Hamidullah' },
  { id: '16', title: 'Environmental Ethics and Stewardship', shelf: 'Shelf 333', publisher: 'Eco-Islam Foundation', author: 'Prof. Fazlun Khalid' },
  { id: '17', title: 'Astronomy and Astrolabe Craft', shelf: 'Shelf 520', publisher: 'Heritage Science Group', author: 'Al-Biruni Research Unit' },
  { id: '18', title: 'Psychology of the Human Soul', shelf: 'Shelf 150', publisher: 'Avicenna Institute', author: 'Ibn Sina Academy' },
  { id: '19', title: 'Global Islamic Movements: A Survey', shelf: 'Shelf 325', publisher: 'Middle East Centre', author: 'Dr. Ali Al-Bayati' },
  { id: '20', title: 'Mastering Arabic Calligraphy', shelf: 'Shelf 745', publisher: 'Fine Arts Guild', author: 'Hafiz Osman Guild' },
  { id: '21', title: 'Architectural Heritage of Cairo', shelf: 'Shelf 720', publisher: 'AUC Press', author: 'Prof. Creswell' },
  { id: '22', title: 'Logic of Demonstration in Theology', shelf: 'Shelf 160', publisher: 'Turath For Publishing', author: 'Imam Al-Razi' },
  { id: '23', title: 'Global Trade Routes of the Silk Road', shelf: 'Shelf 382', publisher: 'Explorers Archive', author: 'Ibn Battuta Archive' },
  { id: '24', title: 'Educational Frameworks in Madrasas', shelf: 'Shelf 370', publisher: 'Madrasa Scholarly Press', author: 'Dr. Makdisi' },
  { id: '25', title: 'Medicine and Healing Traditions', shelf: 'Shelf 610', publisher: 'Traditional Medical Bureau', author: 'Ibn Sina (Avicenna)' },
  { id: '26', title: 'Civil Rights and Minorities', shelf: 'Shelf 323', publisher: 'Oxford University Press', author: 'Dr. Khaled Abou El Fadl' },
  { id: '27', title: 'Poetry of the Pre-Islamic Era', shelf: 'Shelf 892', publisher: 'Classical Verse Bureau', author: 'Al-Muallaqat Editors' },
  { id: '28', title: 'Sociology of Tribal Communities', shelf: 'Shelf 301', publisher: 'Maghreb Academic Press', author: 'Ibn Khaldun' },
  { id: '29', title: 'Musicians and Theory of Sound', shelf: 'Shelf 780', publisher: 'Acoustic Heritage House', author: 'Al-Farabi' },
  { id: '30', title: 'Geometry of Islamic Patterns', shelf: 'Shelf 516', publisher: 'Design Symmetry Guild', author: 'Prof. Eric Broug' }
];

export async function GET() {
  try {
    await db.execute(`DROP TABLE IF EXISTS granthagram_books;`);

    await db.execute(`
      CREATE TABLE granthagram_books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        shelf TEXT NOT NULL,
        publisher TEXT NOT NULL,
        author TEXT NOT NULL
      );
    `);

    for (const book of MOCK_BOOKS) {
      await db.execute({
        sql: `INSERT INTO granthagram_books (id, title, shelf, publisher, author) VALUES (?, ?, ?, ?, ?)`,
        args: [book.id, book.title, book.shelf, book.publisher, book.author]
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully seeded books with authors into Turso!' 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}