# Block Editor - Foundry VTT

Um módulo avançado para Foundry VTT que permite criar e organizar blocos de código visualmente através de uma interface drag-and-drop intuitiva e moderna.

## 🎯 Visão Geral

O Block Editor é uma ferramenta visual que simplifica a criação de comandos complexos no Foundry VTT. Através de uma interface de arrastar e soltar, os usuários podem construir comandos de forma intuitiva sem precisar conhecer a sintaxe específica.

### ✨ Características Principais

- 🧩 **Interface Visual Intuitiva**: Arraste e solte blocos para criar código
- 🎯 **Blocos Especializados**: Blocos específicos para diferentes tipos de dados e operações
- 💻 **Geração Automática de Código**: Converte a organização visual em código JavaScript válido
- 🔄 **Execução em Tempo Real**: Execute o código gerado diretamente no Foundry
- 📋 **Cópia Facilitada**: Copie o código gerado para usar em macros ou outros scripts
- 🎨 **Interface Moderna**: Design limpo, responsivo e acessível
- 🔀 **Dois Modos de Operação**: Normal e Fórmula para diferentes necessidades
- ⌨️ **Atalhos de Teclado**: Acesso rápido via Ctrl+B
- 🌐 **Suporte Multilíngue**: Português e Inglês

## 🏗️ Arquitetura do Código

O módulo foi completamente refatorado com uma arquitetura modular e bem organizada:

### 📁 Estrutura de Arquivos

```
scripts/
├── main.js                 # Integração com Foundry VTT e ponto de entrada
├── BlockEditor.js          # Classe principal orquestradora
├── constants.js            # Definições de blocos e templates HTML
├── ui/
│   └── UIManager.js        # Gerenciamento de interface e interações
└── core/
    └── CodeGenerator.js    # Lógica de geração de código
```

### 🔧 Responsabilidades dos Componentes

#### **main.js** - Integração com Foundry VTT
- Gerencia hooks do Foundry VTT
- Registra configurações do módulo
- Processa comandos de chat (/blocks, /editor)
- Configura atalhos de teclado
- Cria e gerencia diálogos
- Expõe API do módulo

#### **BlockEditor.js** - Orquestrador Principal
- Coordena comunicação entre componentes
- Inicializa UIManager e CodeGenerator
- Fornece interface limpa para acesso externo
- Gerencia ciclo de vida do editor

#### **UIManager.js** - Gerenciamento de Interface
- Controla todas as interações do usuário
- Gerencia drag & drop entre paleta e workspace
- Manipula eventos de botões e checkboxes
- Controla reordenação de blocos no workspace
- Gerencia estados visuais e feedback

#### **CodeGenerator.js** - Geração de Código
- Processa blocos do workspace em código
- Aplica formatação específica por tipo de bloco
- Gerencia diferenças entre modo Normal e Fórmula
- Monta código final com sintaxe apropriada

#### **constants.js** - Definições e Configurações
- Define todos os blocos disponíveis
- Contém templates HTML
- Especifica blocos exclusivos do modo Fórmula
- Lista blocos com conteúdo fixo (read-only)

## 🧩 Blocos Disponíveis

### 📊 Dados do Ator
- **Atributos**: Acessa `actor.system.attributes`
- **Spells**: Acessa `actor.system.spells` (prefixo `S:`)
- **Skills**: Acessa `actor.system.skills` (prefixo `Sk:`)
- **Costs**: Acessa `actor.system.currency` (prefixo `*Costs`)

### 🏷️ Propriedades e Texto
- **Label**: Obtém `.label` de um campo (sempre entre aspas)
- **Text**: Texto literal (sempre entre aspas)

### ⚡ Operadores
- **Mod**: Modificador numérico (sem aspas)
- **Or**: Operador lógico OU (sempre gera `|`)

### ⚔️ Sistema de Combate (Padrão SK)
- **Ranged**: Ataques à distância (prefixo `R:`)
- **Melee**: Ataques corpo a corpo (prefixo `M:`)
- **Weapon Damage**: Dano da arma (prefixo `D:` com aspas)
- **Parry**: Defesa aparar (prefixo `P:`)
- **Damage**: Valores de dano (sem prefixo)

### 🔀 Condicionais (Apenas Modo Fórmula)
- **Check**: Inicia verificação (sempre gera `?`)
- **If**: Bloco condicional (sempre gera `/if`)
- **Else**: Bloco alternativo (sempre gera `/else`)
- **Line**: Separador de linha (sempre gera `/`)
- **Based**: Baseado em valor (prefixo `Based:`)

## 🎮 Modos de Operação

### 📝 Modo Normal
- Gera código envolvido em colchetes: `[conteúdo]`
- Ideal para comandos simples e diretos
- Blind Roll disponível (adiciona prefixo `!`)
- Exemplo: `[M:Spear "Spear Attack"]`

### 🧮 Modo Fórmula
- Cada bloco é envolvido individualmente: `[bloco1] [bloco2]`
- Habilita blocos condicionais (If, Else, Line, Based)
- Desabilita Blind Roll automaticamente
- Ideal para comandos complexos
- Exemplo: `/if [M:Spear] [D:"spear"]`

## 🚀 Como Usar

### 1. **Abrir o Editor**
- **Comando de Chat**: `/blocks` ou `/editor`
- **Atalho de Teclado**: `Ctrl + B`
- **Auto-abertura**: Configure nas configurações do módulo

### 2. **Construir Comandos**
- Arraste blocos da paleta para a área de trabalho
- Organize os blocos na ordem desejada
- Edite o conteúdo dos blocos clicando nos campos de texto
- O código é gerado automaticamente conforme você edita

### 3. **Usar o Código Gerado**
- **Copiar**: Use o botão "Copiar" para copiar para a área de transferência
- **Executar**: Use o botão "Executar" para enviar diretamente para o chat
- **Usar em Macros**: Cole o código copiado em macros ou scripts

## 📋 Exemplos Práticos

### ⚔️ Ataque Simples (Modo Normal)
```
Blocos: Melee → Text("Spear")
Resultado: [M:Spear "Spear"]
```

### 🔀 Comando Condicional (Modo Fórmula)
```
Blocos: If → Melee → Text("Spear") → Weapon Damage → Text("spear")
Resultado: /if [M:Spear] [D:"spear"]
```

### 💥 Ataque com Dano (Modo Fórmula)
```
Blocos: Melee → Text("Sword") → Line → Damage → Text("1d8+2")
Resultado: [M:Sword] / [1d8+2]
```

### 🎲 Teste com Blind Roll (Modo Normal)
```
Blocos: Skills → Text("Athletics") (com Blind Roll ativado)
Resultado: [!Sk:Athletics]
```

## ⚙️ Instalação

1. **Baixar o Módulo**: Faça download dos arquivos do módulo
2. **Extrair**: Extraia na pasta `modules` do seu Foundry VTT
3. **Ativar**: Ative o módulo nas configurações do mundo
4. **Usar**: Use `/blocks` ou `Ctrl + B` para abrir o editor

## 🔧 Configurações

### 📋 Configurações Disponíveis
- **Abrir automaticamente**: Abre o editor quando o mundo carrega
- **Blind Roll**: Adiciona prefixo `!` (desabilitado no Modo Fórmula)
- **Modo Fórmula**: Habilita blocos condicionais e formatação especial

### ⌨️ Comandos e Atalhos
- `/blocks` ou `/editor`: Abre o editor de blocos
- `Ctrl + B`: Atalho de teclado para abrir o editor

## 🎨 Formatação Automática

### 🏷️ Prefixos Automáticos
- **Skills**: `Sk:valor` (sem espaço)
- **Spells**: `S: valor` (com espaço)
- **Costs**: `*Costs valor`
- **Ranged**: `R:valor` (sem espaço)
- **Melee**: `M:valor` (sem espaço)
- **Weapon Damage**: `D:"valor"` (com aspas, sem espaço)
- **Parry**: `P:valor` (sem espaço)
- **Based**: `Based:valor` (sem espaço)

### 📝 Aspas Automáticas
- **Label/Text**: Sempre entre aspas duplas
- **Weapon Damage**: Sempre entre aspas duplas

### 🔒 Valores Fixos (Não Editáveis)
- **Or**: Sempre gera `|`
- **Check**: Sempre gera `?`
- **If**: Sempre gera `/if`
- **Else**: Sempre gera `/else`
- **Line**: Sempre gera `/`

## 🛠️ Desenvolvimento

### 🏗️ Arquitetura de Classes

```javascript
// Classe principal orquestradora
class BlockEditor {
    constructor(html)              // Inicializa componentes
    _initializeComponents()        // Configura comunicação entre componentes
    getUIManager()                 // Acesso ao gerenciador de UI
    getCodeGenerator()             // Acesso ao gerador de código
    generateCode()                 // Geração manual de código
    getWorkspaceState()            // Estado atual do workspace
}

// Gerenciador de interface
class UIManager {
    constructor(html, codeGenerator)  // Inicializa UI
    _setupEventListeners()           // Configura eventos
    _addBlockToWorkspace()           // Adiciona bloco ao workspace
    _setupDragAndDropSystem()        // Sistema de drag & drop
    _clearWorkspace()                // Limpa workspace
    // ... outros métodos de UI
}

// Gerador de código
class CodeGenerator {
    constructor(uiManager)           // Inicializa gerador
    generateCode()                   // Gera código do workspace
    _formatBlockContent()            // Formata conteúdo dos blocos
    _assembleFinalCode()             // Monta código final
    // ... outros métodos de geração
}
```

### 🔧 Constantes Importantes

```javascript
// Blocos disponíveis com configurações
AVAILABLE_BLOCKS = { ... }

// Blocos visíveis apenas no Modo Fórmula
FORMULA_ONLY_BLOCKS = ['if', 'else', 'line', 'based']

// Blocos com conteúdo fixo (não editável)
READONLY_BLOCKS = ['or', 'check', 'if', 'else', 'line']
```

### 📝 Logs e Debugging

O módulo inclui logging detalhado para facilitar o desenvolvimento e debugging:

```javascript
// Exemplos de logs informativos
console.log('Block Editor | UI Manager: Adding block to workspace');
console.log('Block Editor | Code Generator: Processing 3 workspace blocks');
console.log('Block Editor | Main Controller: Component communication established');
```

## 🔍 Compatibilidade

- **Foundry VTT**: v10+ (testado até v13)
- **Sistemas**: Compatível com sistemas que usam padrão SK
- **Navegadores**: Chrome, Firefox, Safari, Edge (versões modernas)

## 🐛 Solução de Problemas

### 📋 Problemas Comuns

1. **Editor não abre**: Verifique se o módulo está ativado
2. **Blocos não aparecem**: Verifique o console para erros
3. **Código não gera**: Certifique-se de que há blocos no workspace
4. **Drag & drop não funciona**: Verifique se o navegador suporta HTML5 drag & drop

### 🔍 Debugging

1. Abra o console do navegador (F12)
2. Procure por mensagens que começam com "Block Editor |"
3. Logs detalhados mostram cada operação realizada
4. Reporte bugs com informações do console

## 📄 Licença

Este módulo é distribuído sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas, problemas ou sugestões:

1. Verifique esta documentação
2. Consulte o console do navegador para logs detalhados
3. Abra uma issue no repositório do projeto
4. Inclua informações do console ao reportar bugs

---

**Desenvolvido com ❤️ para a comunidade Foundry VTT**