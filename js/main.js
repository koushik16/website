// Mobile navigation toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const terminalLines = document.getElementById('terminal-lines');
const terminalInputBar = document.getElementById('terminal-inputbar');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ===== Terminal: Shared helpers =====
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function scrollTerminalToBottom() {
    if (terminalLines) {
        terminalLines.scrollTop = terminalLines.scrollHeight;
    }
}

// ===== Terminal: Boot animation data =====
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
        output: ['ML Engineer | AI Systems | Research | Teaching']
    },
    {
        prompt: 'koushik@system:~$',
        command: 'ls',
        output: ['about/  skills/  experience/  research-experience/  teaching/  projects/  research/  articles/  certifications/  contact/'],
        links: [
            { label: 'experience/', target: '#experience' },
            { label: 'projects/', target: '#projects' },
            { label: 'research/', target: '#research' },
            { label: 'articles/', target: '#articles' },
            { label: 'contact/', target: '#contact' }
        ]
    }
];

// ===== Terminal: Boot animation DOM helpers =====
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

// ===== Terminal: Boot animation =====
async function typeBootLine(text) {
    const line = createTerminalLine();
    const content = document.createElement('span');
    const caret = createCaret();
    line.append(content, caret);
    await typeIntoElement(content, text, 14);
    caret.remove();
    scrollTerminalToBottom();
    await sleep(120);
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

        await typeIntoElement(output, block.output[outputIndex], 9);

        if (block.links && outputIndex === block.output.length - 1) {
            buildLsLinksLine(outputLine, block.links, isLastOutputLine);
        }

        if (!isLastOutputLine) {
            outputCaret.remove();
        }

        scrollTerminalToBottom();
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

    initTerminalInput();
}

// ===== Terminal: Interactive commands =====
const VIRTUAL_FS_ROOT = [
    { name: 'about', target: '#about' },
    { name: 'skills', target: '#skills' },
    { name: 'experience', target: '#experience' },
    { name: 'research-experience', target: '#research-experience' },
    { name: 'teaching', target: '#teaching' },
    { name: 'projects', target: '#projects', hasChildren: true },
    { name: 'research', target: '#research' },
    { name: 'articles', target: '#articles' },
    { name: 'certifications', target: '#certifications' },
    { name: 'contact', target: '#contact' }
];

const VIRTUAL_FS_PROJECTS = [
    'career-recommendation-rag',
    'drug-synergy-gnn',
    'eeg-seizure-detection'
];

let terminalCwd = '~';
let terminalHistory = [];
let historyPointer = -1;
let inputPromptSpan = null;
let inputEl = null;

function buildPromptString() {
    return `koushik@system:${terminalCwd}$`;
}

function updateInputPrompt() {
    if (inputPromptSpan) {
        inputPromptSpan.textContent = `${buildPromptString()} `;
    }
}

function getCurrentDirEntry() {
    if (terminalCwd === '~') {
        return { children: VIRTUAL_FS_ROOT };
    }
    const sectionName = terminalCwd.replace('~/', '');
    const parent = VIRTUAL_FS_ROOT.find(e => e.name === sectionName);
    if (parent && parent.hasChildren) {
        return { children: VIRTUAL_FS_PROJECTS.map(name => ({ name, target: '#projects' })) };
    }
    return null;
}

function insertSpacerLine() {
    const spacer = document.createElement('div');
    spacer.className = 'terminal-line terminal-line--spacer';
    terminalLines.appendChild(spacer);
}

function appendInteractiveOutputLines(outputLines) {
    outputLines.forEach(line => {
        const p = document.createElement('p');
        p.className = 'terminal-line';
        if (typeof line === 'string') {
            p.textContent = line;
        } else if (line && line.links) {
            buildLsLinksLine(p, line.links, false);
        } else if (line && typeof line.text === 'string') {
            if (line.className) {
                p.className += ` ${line.className}`;
            }
            p.textContent = line.text;
        }
        terminalLines.appendChild(p);
    });
    scrollTerminalToBottom();
}

function echoCommandLine(rawCmd) {
    const p = document.createElement('p');
    p.className = 'terminal-line';
    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal-prompt';
    promptSpan.textContent = `${buildPromptString()} `;
    const cmdSpan = document.createElement('span');
    cmdSpan.textContent = rawCmd;
    p.append(promptSpan, cmdSpan);
    terminalLines.appendChild(p);
}

function cmdHelp() {
    return [
        { text: 'Available commands:', className: 'terminal-output--muted' },
        '  help                    show this help',
        '  ls                      list sections or items',
        '  pwd                     print working directory',
        '  cd <section>            navigate on Enter only (Tab = autocomplete)',
        '  whoami                  show current user',
        '  cat <file>              read a file (role.txt, focus.txt)',
        '  clear                   clear terminal output',
        '',
        { text: 'Sections: about  skills  experience  research-experience  teaching  projects  research  articles  certifications  contact', className: 'terminal-output--muted' }
    ];
}

function cmdLs() {
    const dir = getCurrentDirEntry();
    if (!dir) {
        return [{ text: `ls: no items in '${terminalCwd}'`, className: 'terminal-output--error' }];
    }
    if (terminalCwd === '~') {
        const links = dir.children.map(e => ({ label: `${e.name}/`, target: e.target }));
        return [{ links }];
    }
    return [dir.children.map(e => e.name).join('  ')];
}

function cmdPwd() {
    const path = terminalCwd === '~'
        ? '/home/koushik'
        : `/home/koushik/${terminalCwd.replace('~/', '')}`;
    return [path];
}

function cmdCd(args) {
    const target = (args[0] || '').trim();

    if (!target || target === '~') {
        terminalCwd = '~';
        updateInputPrompt();
        return [];
    }

    if (target === '..') {
        if (terminalCwd !== '~') {
            terminalCwd = '~';
            updateInputPrompt();
        }
        return [];
    }

    if (terminalCwd === '~') {
        const entry = VIRTUAL_FS_ROOT.find(e => e.name === target);
        if (entry) {
            terminalCwd = `~/${entry.name}`;
            updateInputPrompt();
            document.querySelector(entry.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return [];
        }
        return [{ text: `cd: no such directory: ${target}`, className: 'terminal-output--error' }];
    }

    const sectionName = terminalCwd.replace('~/', '');
    const parentEntry = VIRTUAL_FS_ROOT.find(e => e.name === sectionName);
    if (parentEntry && parentEntry.hasChildren && VIRTUAL_FS_PROJECTS.includes(target)) {
        document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return [];
    }

    return [{ text: `cd: no such directory: ${target}`, className: 'terminal-output--error' }];
}

function cmdClear() {
    terminalLines.textContent = '';
    return [];
}

function cmdWhoami() {
    return ['Koushik Reddy Parukola'];
}

function cmdCat(args) {
    const file = (args[0] || '').toLowerCase();
    if (file === 'role.txt') {
        return ['ML Engineer | AI Systems | Research | Teaching'];
    }
    if (file === 'focus.txt') {
        return [
            '> Agentic AI systems',
            '> Retrieval and ranking quality',
            '> Production reliability, latency, and cost'
        ];
    }
    const name = args[0] || '(no file)';
    return [{ text: `cat: ${name}: No such file or directory`, className: 'terminal-output--error' }];
}

const TERMINAL_COMMANDS = ['help', 'ls', 'pwd', 'cd', 'clear', 'whoami', 'cat'];

function executeCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) {
        return [];
    }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
        case 'help': return cmdHelp();
        case 'ls': return cmdLs();
        case 'pwd': return cmdPwd();
        case 'cd': return cmdCd(args);
        case 'clear': return cmdClear();
        case 'whoami': return cmdWhoami();
        case 'cat': return cmdCat(args);
        default:
            return [{ text: `zsh: command not found: ${cmd}`, className: 'terminal-output--error' }];
    }
}

function handleTerminalKeydown(event) {
    if (!inputEl) {
        return;
    }

    if (event.key === 'Enter') {
        const raw = inputEl.value;
        inputEl.value = '';
        historyPointer = -1;

        if (raw.trim()) {
            terminalHistory.unshift(raw);
            if (terminalHistory.length > 50) {
                terminalHistory.pop();
            }
        }

        echoCommandLine(raw);
        const output = executeCommand(raw);
        appendInteractiveOutputLines(output);
        insertSpacerLine();
        scrollTerminalToBottom();
        return;
    }

    if (event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();

        const value = inputEl.value;
        const spaceIdx = value.indexOf(' ');
        let matches = [];
        let prefix = '';

        if (spaceIdx === -1) {
            matches = TERMINAL_COMMANDS.filter(c => c.startsWith(value));
            prefix = '';
        } else {
            const cmd = value.slice(0, spaceIdx);
            const partial = value.slice(spaceIdx + 1);
            prefix = `${cmd} `;

            if (cmd === 'cd') {
                const dir = getCurrentDirEntry();
                const names = dir ? dir.children.map(e => e.name) : [];
                matches = names.filter(n => n.startsWith(partial));
            } else if (cmd === 'cat') {
                matches = ['role.txt', 'focus.txt'].filter(f => f.startsWith(partial));
            }
        }

        if (matches.length === 1) {
            inputEl.value = prefix + matches[0];
        } else if (matches.length > 1) {
            appendInteractiveOutputLines([
                { text: matches.join('  '), className: 'terminal-output--muted' }
            ]);
            insertSpacerLine();
            scrollTerminalToBottom();
        }

        return;
    }

    if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (historyPointer < terminalHistory.length - 1) {
            historyPointer += 1;
            inputEl.value = terminalHistory[historyPointer];
        }
        return;
    }

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (historyPointer > 0) {
            historyPointer -= 1;
            inputEl.value = terminalHistory[historyPointer];
        } else {
            historyPointer = -1;
            inputEl.value = '';
        }
    }
}

function initTerminalInput() {
    if (!terminalLines || !terminalInputBar) {
        return;
    }

    terminalLines.querySelectorAll('.terminal-caret').forEach(c => c.remove());

    terminalInputBar.textContent = '';
    const row = document.createElement('p');
    row.className = 'terminal-line terminal-input-row';

    inputPromptSpan = document.createElement('span');
    inputPromptSpan.className = 'terminal-prompt';
    inputPromptSpan.textContent = `${buildPromptString()} `;

    inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.className = 'terminal-input';
    inputEl.setAttribute('autocomplete', 'off');
    inputEl.setAttribute('spellcheck', 'false');
    inputEl.setAttribute('aria-label', 'Terminal command input');

    row.append(inputPromptSpan, inputEl);
    terminalInputBar.appendChild(row);

    const terminalHeroEl = document.getElementById('terminal-hero');
    if (terminalHeroEl) {
        terminalHeroEl.addEventListener('click', () => inputEl?.focus());
    }

    inputEl.addEventListener('keydown', handleTerminalKeydown);
    scrollTerminalToBottom();

    setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
            inputEl?.focus();
        }
    }, 60);
}

// ===== Navbar: hide during hero, show after =====
function initNavbarHide() {
    const header = document.getElementById('header');
    const hero = document.getElementById('hero');
    if (!header || !hero) {
        return;
    }

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    header.classList.add('header--at-hero');
                } else {
                    header.classList.remove('header--at-hero');
                }
            });
        },
        { threshold: 0.2 }
    );

    observer.observe(hero);
}

// ===== Scroll reveal animation =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.highlight-card, .skill-category, .timeline__item, .project-card, .cert-card, .contact-card, .pub-card, .article-card'
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

// ===== Active nav link highlight on scroll =====
function initActiveNav() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav__link');

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('nav__link--active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        },
        { rootMargin: '-40% 0px -60% 0px' }
    );

    sections.forEach(section => observer.observe(section));
}

document.addEventListener('DOMContentLoaded', () => {
    initTerminalHero();
    initNavbarHide();
    initScrollReveal();
    initActiveNav();
});
