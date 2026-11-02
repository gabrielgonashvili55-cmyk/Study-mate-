import { StudyDocument } from '../types';

export const SAMPLE_DOCUMENTS: StudyDocument[] = [
  {
    id: 'sample-doc-biology',
    title: 'Cellular Biology & Molecular Genetics',
    fileName: 'Bio101_Cellular_Mechanisms.pdf',
    fileSize: 428000,
    pageCount: 6,
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastStudied: new Date().toISOString(),
    tags: ['Biology', 'Genetics', 'Biochemistry'],
    pages: [
      {
        pageNumber: 1,
        text: `Chapter 1: Cellular Architecture and Organelles
The cell represents the fundamental structural and functional unit of all living organisms. Eukaryotic cells possess membrane-bound organelles that partition biochemical pathways into specialized intracellular compartments.
The Plasma Membrane is defined as a selectively permeable phospholipid bilayer embedded with transport proteins, cholesterol, and glycoproteins. It regulates homeostatic equilibrium between intracellular cytoplasm and extracellular fluid.
The Nucleus acts as the genetic command repository, enclosing genomic DNA organized into chromatin threads. The nucleolus, situated within the nuclear matrix, synthesizes ribosomal RNA (rRNA) and coordinates ribosomal subunit assembly.
Mitochondria are double-membraned organelles known as the metabolic power generators of eukaryotic cells. The inner mitochondrial membrane is extensively folded into cristae to maximize surface area for the Electron Transport Chain (ETC) and ATP Synthase complexes.`,
      },
      {
        pageNumber: 2,
        text: `Chapter 2: Bioenergetics and Cellular Respiration
Cellular respiration is the biochemical oxidation of glucose substrates into carbon dioxide, water, and usable adenosine triphosphate (ATP). The overall chemical equation is: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~30-32 ATP.
Phase 1: Glycolysis occurs strictly within the cytosol and does not require molecular oxygen (anaerobic). During glycolysis, a 6-carbon glucose molecule is cleaved into two 3-carbon pyruvate molecules, yielding a net gain of 2 ATP and 2 NADH molecules via substrate-level phosphorylation.
Phase 2: The Pyruvate Dehydrogenase complex translocates pyruvate into the mitochondrial matrix, converting it into Acetyl-CoA while releasing CO2 and reducing NAD+ to NADH.
Phase 3: The Citric Acid Cycle (Krebs Cycle) oxidizes Acetyl-CoA in cyclic enzymatic steps, yielding 2 ATP, 6 NADH, and 2 FADH2 per glucose molecule.
Phase 4: Oxidative Phosphorylation utilizes the proton-motive force across the inner mitochondrial membrane. Chemiosmosis couples proton flux through ATP Synthase to drive phosphorylation of ADP into ATP.`,
      },
      {
        pageNumber: 3,
        text: `Chapter 3: Central Dogma of Molecular Biology
The Central Dogma describes the directional flow of sequential genetic information: DNA is transcribed into messenger RNA (mRNA), which is subsequently translated into functional polypeptide chains.
Transcription is the enzymatic synthesis of RNA from a complementary DNA template strand, catalyzed by RNA Polymerase. In eukaryotes, the pre-mRNA transcript undergoes post-transcriptional modifications: 5' 7-methylguanosine capping, 3' polyadenylation (poly-A tail addition), and alternative splicing by spliceosomes where non-coding introns are excised and protein-coding exons are ligated.
Translation occurs on ribosomes in the cytoplasm. Transfer RNA (tRNA) molecules carry specific amino acids matching the triplet codons of mRNA according to the universal genetic code. The AUG codon signifies initiation and encodes Methionine. Stop codons (UAA, UAG, UGA) recruit release factors, culminating in polypeptide dissociation.`,
      },
      {
        pageNumber: 4,
        text: `Chapter 4: Cell Division and Mitosis
The Cell Cycle is divided into Interphase (G1, S, and G2 phases) and the M Phase (Mitosis and Cytokinesis). During the S phase, DNA replication duplicates chromosomes into identical sister chromatids joined at the centromere.
Mitosis ensures equitable distribution of duplicated genome to two genetically identical daughter cells through four sequential stages:
1. Prophase: Chromatin condenses into visible chromosomes; mitotic spindle fibers assemble from centrosomes; the nuclear envelope begins degrading.
2. Metaphase: Chromosomes align precisely along the equatorial metaphase plate, held by kinetochore microtubules under balanced tension.
3. Anaphase: Cohesin proteins holding sister chromatids are cleaved, allowing spindle fibers to pull chromatids toward opposite spindle poles.
4. Telophase: Nuclear envelopes reform around separated daughter nuclei, chromosomes decondense back into chromatin, and cytokinesis cleaves the cytoplasm via a contractile actin-myosin ring.`,
      },
    ],
    rawText: `Chapter 1: Cellular Architecture and Organelles
The cell represents the fundamental structural and functional unit of all living organisms. Eukaryotic cells possess membrane-bound organelles that partition biochemical pathways into specialized intracellular compartments.
The Plasma Membrane is defined as a selectively permeable phospholipid bilayer embedded with transport proteins, cholesterol, and glycoproteins. It regulates homeostatic equilibrium between intracellular cytoplasm and extracellular fluid.
The Nucleus acts as the genetic command repository, enclosing genomic DNA organized into chromatin threads. The nucleolus, situated within the nuclear matrix, synthesizes ribosomal RNA (rRNA) and coordinates ribosomal subunit assembly.
Mitochondria are double-membraned organelles known as the metabolic power generators of eukaryotic cells. The inner mitochondrial membrane is extensively folded into cristae to maximize surface area for the Electron Transport Chain (ETC) and ATP Synthase complexes.

Chapter 2: Bioenergetics and Cellular Respiration
Cellular respiration is the biochemical oxidation of glucose substrates into carbon dioxide, water, and usable adenosine triphosphate (ATP). The overall chemical equation is: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~30-32 ATP.
Phase 1: Glycolysis occurs strictly within the cytosol and does not require molecular oxygen (anaerobic). During glycolysis, a 6-carbon glucose molecule is cleaved into two 3-carbon pyruvate molecules, yielding a net gain of 2 ATP and 2 NADH molecules via substrate-level phosphorylation.
Phase 2: The Pyruvate Dehydrogenase complex translocates pyruvate into the mitochondrial matrix, converting it into Acetyl-CoA while releasing CO2 and reducing NAD+ to NADH.
Phase 3: The Citric Acid Cycle (Krebs Cycle) oxidizes Acetyl-CoA in cyclic enzymatic steps, yielding 2 ATP, 6 NADH, and 2 FADH2 per glucose molecule.
Phase 4: Oxidative Phosphorylation utilizes the proton-motive force across the inner mitochondrial membrane. Chemiosmosis couples proton flux through ATP Synthase to drive phosphorylation of ADP into ATP.

Chapter 3: Central Dogma of Molecular Biology
The Central Dogma describes the directional flow of sequential genetic information: DNA is transcribed into messenger RNA (mRNA), which is subsequently translated into functional polypeptide chains.
Transcription is the enzymatic synthesis of RNA from a complementary DNA template strand, catalyzed by RNA Polymerase. In eukaryotes, the pre-mRNA transcript undergoes post-transcriptional modifications: 5' 7-methylguanosine capping, 3' polyadenylation (poly-A tail addition), and alternative splicing by spliceosomes where non-coding introns are excised and protein-coding exons are ligated.
Translation occurs on ribosomes in the cytoplasm. Transfer RNA (tRNA) molecules carry specific amino acids matching the triplet codons of mRNA according to the universal genetic code. The AUG codon signifies initiation and encodes Methionine. Stop codons (UAA, UAG, UGA) recruit release factors, culminating in polypeptide dissociation.

Chapter 4: Cell Division and Mitosis
The Cell Cycle is divided into Interphase (G1, S, and G2 phases) and the M Phase (Mitosis and Cytokinesis). During the S phase, DNA replication duplicates chromosomes into identical sister chromatids joined at the centromere.
Mitosis ensures equitable distribution of duplicated genome to two genetically identical daughter cells through four sequential stages:
1. Prophase: Chromatin condenses into visible chromosomes; mitotic spindle fibers assemble from centrosomes; the nuclear envelope begins degrading.
2. Metaphase: Chromosomes align precisely along the equatorial metaphase plate, held by kinetochore microtubules under balanced tension.
3. Anaphase: Cohesin proteins holding sister chromatids are cleaved, allowing spindle fibers to pull chromatids toward opposite spindle poles.
4. Telophase: Nuclear envelopes reform around separated daughter nuclei, chromosomes decondense back into chromatin, and cytokinesis cleaves the cytoplasm via a contractile actin-myosin ring.`,
    summary: {
      overview:
        'A comprehensive foundational curriculum in eukaryotic cell biology, cellular respiration energetics, DNA transcription and translation mechanisms, and mitotic cell division cycles.',
      chapters: [
        {
          chapterNumber: 1,
          title: 'Cellular Architecture and Organelles',
          summary:
            'Eukaryotic cells are partitioned by specialized organelles. The plasma membrane maintains homeostatic boundaries, the nucleus stores chromatin and synthesizes rRNA, while mitochondria generate metabolic ATP across folded cristae membranes.',
          keyTakeaways: [
            'Phospholipid bilayers provide selective permeability to the cytoplasm.',
            'Nucleolus is the primary site of ribosome biogenesis.',
            'Cristae geometry in mitochondria optimizes surface area for oxidative phosphorylation.',
          ],
          definitions: [
            {
              term: 'Plasma Membrane',
              definition: 'Selectively permeable phospholipid bilayer regulating intracellular and extracellular ion fluxes.',
              importance: 'Critical cellular barrier',
            },
            {
              term: 'Mitochondria',
              definition: 'Double-membraned organelle responsible for ATP synthesis via the electron transport chain.',
              importance: 'Metabolic engine',
            },
          ],
        },
        {
          chapterNumber: 2,
          title: 'Bioenergetics and Cellular Respiration',
          summary:
            'Aerobic respiration converts glucose into 30-32 ATP through four connected phases: anaerobic cytosolic glycolysis, pyruvate oxidation, mitochondrial matrix Krebs cycle, and chemiosmotic oxidative phosphorylation.',
          keyTakeaways: [
            'Glycolysis generates a net of 2 ATP and 2 NADH without oxygen in the cytoplasm.',
            'Krebs Cycle yields high-energy electron carriers (NADH & FADH2).',
            'Chemiosmosis harnesses proton-motive gradients across inner mitochondrial membranes to drive ATP Synthase.',
          ],
          definitions: [
            {
              term: 'Glycolysis',
              definition: 'Enzymatic cleavage of 6-carbon glucose into two 3-carbon pyruvates producing net 2 ATP.',
              importance: 'Anaerobic metabolic foundation',
            },
            {
              term: 'ATP Synthase',
              definition: 'Rotary membrane enzyme complex coupling proton gradient dissipation to ADP phosphorylation.',
              importance: 'Primary ATP generator',
            },
          ],
          formulasOrRules: ['C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~30-32 ATP'],
        },
        {
          chapterNumber: 3,
          title: 'Central Dogma of Molecular Biology',
          summary:
            'Genetic information transitions directionally from DNA to mRNA via RNA polymerase transcription, followed by splicing and cytoplasmic ribosome-mediated translation into functional proteins.',
          keyTakeaways: [
            'Eukaryotic pre-mRNA requires 5-capping, 3-polyadenylation, and spliceosome intron excision.',
            'AUG is the universal start codon encoding Methionine.',
            'tRNA anticodons align with mRNA triplets on the ribosomal peptidyl transferase center.',
          ],
          definitions: [
            {
              term: 'Transcription',
              definition: 'Synthesis of complementary single-stranded RNA from a DNA template strand by RNA Polymerase.',
              importance: 'Gene expression regulation',
            },
            {
              term: 'Spliceosome',
              definition: 'Ribonucleoprotein complex responsible for excising introns and ligating exons in pre-mRNA.',
              importance: 'Post-transcriptional modification',
            },
          ],
        },
        {
          chapterNumber: 4,
          title: 'Cell Division and Mitosis',
          summary:
            'Following S-phase DNA duplication, somatic cells undergo prophase, metaphase, anaphase, and telophase to divide duplicated genomes equally into identical daughter cells.',
          keyTakeaways: [
            'Kinetochores connect chromatids to mitotic spindle fibers during metaphase.',
            'Cohesin cleavage at anaphase drives sister chromatid segregation.',
            'Cytokinesis mechanically cleaves cells using a contractile actin-myosin ring.',
          ],
          definitions: [
            {
              term: 'Mitosis',
              definition: 'Eukaryotic nuclear division process generating two genetically identical daughter nuclei.',
              importance: 'Tissue growth & regeneration',
            },
          ],
        },
      ],
      glossary: [
        {
          term: 'ATP Synthase',
          definition: 'Enzyme complex synthesizing ATP from ADP using electrochemical proton gradients.',
        },
        {
          term: 'Cristae',
          definition: 'Infoldings of the inner mitochondrial membrane expanding active surface area.',
        },
        {
          term: 'Glycolysis',
          definition: 'Cytoplasmic ten-step metabolic pathway converting glucose into pyruvate.',
        },
        {
          term: 'AUG Codon',
          definition: 'The universal translation initiation sequence encoding methionine.',
        },
        {
          term: 'Kinetochore',
          definition: 'Protein plaque on chromosome centromeres binding mitotic spindle fibers.',
        },
      ],
      studyTips: [
        'Draw out the four stages of cellular respiration to memorize carbon numbers and electron yields.',
        'Review the difference between transcription (nucleus) and translation (cytosol/ribosome).',
        'Memorize the M-phase order using the PMAT mnemonic (Prophase, Metaphase, Anaphase, Telophase).',
      ],
      generatedWith: 'gemini',
      generatedAt: new Date().toISOString(),
    },
    flashcards: [
      {
        id: 'bio-card-1',
        front: 'Where does glycolysis take place within the eukaryotic cell, and is oxygen required?',
        back: 'Glycolysis occurs in the cytoplasm (cytosol) and is completely anaerobic (does not require oxygen).',
        hint: 'Outside the mitochondria in the liquid matrix.',
        category: 'Cellular Respiration',
        difficulty: 'easy',
        status: 'mastered',
        reviewCount: 3,
      },
      {
        id: 'bio-card-2',
        front: 'What is the primary function of ATP Synthase in oxidative phosphorylation?',
        back: 'It harnesses the potential energy of the proton-motive force across the inner mitochondrial membrane to phosphorylate ADP into ATP.',
        hint: 'Chemiosmosis molecular rotor.',
        category: 'Bioenergetics',
        difficulty: 'medium',
        status: 'learning',
        reviewCount: 2,
      },
      {
        id: 'bio-card-3',
        front: 'What are the three main post-transcriptional modifications made to eukaryotic pre-mRNA?',
        back: '1. Addition of a 5\' 7-methylguanosine cap.\n2. Addition of a 3\' poly-A tail.\n3. RNA splicing by spliceosomes (introns removed, exons joined).',
        hint: 'Protection on both ends plus intron removal.',
        category: 'Molecular Genetics',
        difficulty: 'medium',
        status: 'new',
        reviewCount: 0,
      },
      {
        id: 'bio-card-4',
        front: 'During which mitotic stage do sister chromatids separate toward opposite poles?',
        back: 'Anaphase. Cohesin proteins are cleaved, and kinetochore microtubules shorten, pulling chromatids apart.',
        hint: 'Third stage of PMAT.',
        category: 'Cell Division',
        difficulty: 'easy',
        status: 'mastered',
        reviewCount: 4,
      },
      {
        id: 'bio-card-5',
        front: 'What universal codon initiates translation, and which amino acid does it encode?',
        back: 'The AUG codon initiates translation and encodes Methionine (Met).',
        hint: 'Three letter nucleotide sequence.',
        category: 'Molecular Genetics',
        difficulty: 'easy',
        status: 'learning',
        reviewCount: 1,
      },
    ],
    quizzes: [
      {
        id: 'bio-q-1',
        question: 'Which metabolic stage yields the greatest net number of ATP molecules during cellular respiration?',
        options: [
          'Cytoplasmic Glycolysis',
          'Pyruvate Oxidation to Acetyl-CoA',
          'The Citric Acid (Krebs) Cycle',
          'Oxidative Phosphorylation (Chemiosmosis)',
        ],
        correctIndex: 3,
        explanation:
          'Oxidative phosphorylation yields approximately 26 to 28 ATP via the electron transport chain and ATP Synthase, far surpassing glycolysis (2 ATP) and the Krebs cycle (2 ATP).',
        difficulty: 'medium',
        topic: 'Bioenergetics',
      },
      {
        id: 'bio-q-2',
        question: 'What is the role of spliceosomes during eukaryotic gene expression?',
        options: [
          'Synthesize complementary DNA strands during S-phase replication',
          'Remove non-coding introns and join coding exons in pre-mRNA',
          'Phosphorylate nuclear pore complexes during prophase',
          'Transport charged tRNA molecules to the ribosomal A-site',
        ],
        correctIndex: 1,
        explanation:
          'Spliceosomes are ribonucleoprotein complexes that perform RNA splicing, precisely excising non-coding introns and ligating functional exons before export to cytoplasm.',
        difficulty: 'medium',
        topic: 'Molecular Genetics',
      },
      {
        id: 'bio-q-3',
        question: 'During which phase of the cell cycle is genomic DNA replicated into sister chromatids?',
        options: ['G1 Phase', 'S Phase (Synthesis)', 'G2 Phase', 'Metaphase'],
        correctIndex: 1,
        explanation:
          'DNA replication occurs exclusively during the S (Synthesis) phase of Interphase, ensuring exact duplication prior to chromosome segregation in M phase.',
        difficulty: 'easy',
        topic: 'Cell Division',
      },
    ],
    exams: [
      {
        id: 'bio-exam-1',
        title: 'Cellular Biology Practice Exam',
        description: 'Comprehensive diagnostic exam covering organelle biochemistry, respiration, central dogma, and mitotic division.',
        timeLimitMinutes: 15,
        passingScorePercent: 70,
        topicsCovered: ['Cell Architecture', 'Respiration & ATP', 'Central Dogma', 'Cell Division'],
        questions: [
          {
            id: 'bx-1',
            question: 'Which cellular structure is directly responsible for ribosomal RNA (rRNA) transcription and assembly?',
            options: ['Golgi Apparatus', 'Nucleolus', 'Smooth Endoplasmic Reticulum', 'Centrosome'],
            correctIndex: 1,
            explanation: 'The nucleolus is the specialized nuclear sub-compartment dedicated to rRNA synthesis and ribosome subunit packaging.',
            difficulty: 'easy',
            topic: 'Cell Architecture',
          },
          {
            id: 'bx-2',
            question: 'What is the net yield of ATP produced per glucose molecule during glycolysis?',
            options: ['1 ATP', '2 ATP', '4 ATP', '32 ATP'],
            correctIndex: 1,
            explanation: 'Glycolysis consumes 2 ATP during investment and produces 4 ATP during payoff, resulting in a net gain of 2 ATP.',
            difficulty: 'easy',
            topic: 'Respiration & ATP',
          },
          {
            id: 'bx-3',
            question: 'Which enzyme is responsible for synthesizing RNA from a DNA template during transcription?',
            options: ['DNA Polymerase III', 'RNA Polymerase', 'Helicase', 'Topoisomerase'],
            correctIndex: 1,
            explanation: 'RNA Polymerase binds promoter regions to synthesize complementary single-stranded RNA molecules from DNA.',
            difficulty: 'medium',
            topic: 'Central Dogma',
          },
          {
            id: 'bx-4',
            question: 'At which mitotic checkpoint does the cell verify that all kinetochores are securely attached to spindle fibers?',
            options: ['G1/S Checkpoint', 'G2/M Checkpoint', 'Spindle Assembly (Metaphase) Checkpoint', 'Telophase Checkpoint'],
            correctIndex: 2,
            explanation: 'The Spindle Assembly Checkpoint during metaphase prevents anaphase onset until all kinetochores are under tension from opposite spindle poles.',
            difficulty: 'hard',
            topic: 'Cell Division',
          },
          {
            id: 'bx-5',
            question: 'What creates the proton-motive force used by ATP Synthase in mitochondria?',
            options: [
              'Direct enzymatic hydrolysis of glucose in matrix',
              'Active pumping of H+ ions into the intermembrane space by the electron transport chain',
              'Active transport of sodium-potassium ATPase on cristae',
              'Breakdown of pyruvate into lactic acid',
            ],
            correctIndex: 1,
            explanation: 'Complexes I, III, and IV pump protons from the matrix into the intermembrane space, generating an electrochemical gradient.',
            difficulty: 'medium',
            topic: 'Respiration & ATP',
          },
        ],
        attempts: [],
      },
    ],
  },
];
