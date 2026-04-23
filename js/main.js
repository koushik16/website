// Mobile navigation toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const terminalLines = document.getElementById('terminal-lines');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

const TERMINAL_BOOT_SEQUENCE = [
    'Initializing environment...',
    'Loading profile...'
];

const TERMINAL_COMMAND_SEQUENCE = [
    {
        prompt: 'koushik@system:~$',
        command: 'whoami',
        output: ['Koushik Reddy Parukola']
    },
    {
        prompt: 'koushik@system:~$',
        command: 'cat role.txt',
        output: ['ML Engineer | AI Systems | Research']
    },
    {
        prompt: 'koushik@system:~$',
        command: 'cat focus.txt',
        output: [
            '> End-to-end ML pipelines',
            '> Multimodal AI systems',
            '> Real-time inference and deployment'
        ]
    },
    {
        prompt: 'koushik@system:~$',
        command: 'ls',
        output: ['projects/  experience/  research/  contact/'],
        links: [
            { label: 'projects/', target: '#projects' },
            { label: 'experience/', target: '#experience' },
            { label: 'research/', target: '#projects' },
            { label: 'contact/', target: '#contact' }
        ]
    }
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createTerminalLine(className = '') {
    const line = document.createElement('p');
    line.className = `terminal-line${className ? ` ${className}` : ''}`;
    terminalLines.appendChild(line);
    return line;
}

function createCaret() {
    const caret = document.createElement('span');
    caret.className = 'terminal-caret';
    return caret;
}

async function typeIntoElement(el, text, delayMs) {
    for (const char of text) {
        el.textContent += char;
        await sleep(delayMs);
    }
}

function addSpacerLine() {
    const spacer = document.createElement('div');
    spacer.className = 'terminal-line terminal-line--spacer';
    terminalLines.appendChild(spacer);
}

function buildLsLinksLine(line, links, keepCaret = false) {
    line.textContent = '';

    links.forEach((link, index) => {
        const anchor = document.createElement('a');
        anchor.className = 'terminal-link';
        anchor.href = link.target;
        anchor.textContent = link.label;
        anchor.addEventListener('click', event => {
            event.preventDefault();
            document.querySelector(link.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        line.appendChild(anchor);

        if (index < links.length - 1) {
            line.append(document.createTextNode('  '));
        }
    });

    if (keepCaret) {
        line.append(createCaret());
    }
}

async function typeBootLine(text) {
    const line = createTerminalLine();
    const content = document.createElement('span');
    const caret = createCaret();
    line.append(content, caret);
    await typeIntoElement(content, text, 14);
    caret.remove();
    await sleep(140);
}

async function typeCommandBlock(block, isLastBlock) {
    const commandLine = createTerminalLine();
    const prompt = document.createElement('span');
    prompt.className = 'terminal-prompt';
    prompt.textContent = `${block.prompt} `;
    const command = document.createElement('span');
    const commandCaret = createCaret();
    commandLine.append(prompt, command, commandCaret);

    await typeIntoElement(command, block.command, 13);
    commandCaret.remove();
    await sleep(90);

    for (let outputIndex = 0; outputIndex < block.output.length; outputIndex += 1) {
        const isLastOutputLine = isLastBlock && outputIndex === block.output.length - 1;
        const outputLine = createTerminalLine();
        const output = document.createElement('span');
        const outputCaret = createCaret();
        outputLine.append(output, outputCaret);

        await typeIntoElement(output, block.output[outputIndex], 10);

        if (block.links && outputIndex === block.output.length - 1) {
            buildLsLinksLine(outputLine, block.links, isLastOutputLine);
        }

        if (!isLastOutputLine) {
            outputCaret.remove();
        }
    }
}

async function initTerminalHero() {
    if (!terminalLines) {
        return;
    }

    terminalLines.textContent = '';

    for (const line of TERMINAL_BOOT_SEQUENCE) {
        await typeBootLine(line);
    }

    addSpacerLine();

    for (let blockIndex = 0; blockIndex < TERMINAL_COMMAND_SEQUENCE.length; blockIndex += 1) {
        const block = TERMINAL_COMMAND_SEQUENCE[blockIndex];
        const isLast = blockIndex === TERMINAL_COMMAND_SEQUENCE.length - 1;
        await typeCommandBlock(block, isLast);

        if (!isLast) {
            addSpacerLine();
            await sleep(120);
        }
    }
}

// Scroll reveal animation using IntersectionObserver
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.highlight-card, .skill-category, .timeline__item, .project-card, .cert-card, .contact-card'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    revealElements.forEach(el => observer.observe(el));
}

// Active nav link highlight on scroll
function initActiveNav() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav__link');

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle(
                            'nav__link--active',
                            link.getAttribute('href') === `#${id}`
                        );
                    });
                }
            });
        },
        { rootMargin: '-40% 0px -60% 0px' }
    );

    sections.forEach(section => observer.observe(section));
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initTerminalHero();
    initScrollReveal();
    initActiveNav();
});
