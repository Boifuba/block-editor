# Editor de Blocos - Foundry VTT

Um módulo para Foundry VTT que permite criar e organizar blocos de código visualmente através de uma interface drag-and-drop.

## Arquitetura do Código

O módulo foi estruturado de forma modular para facilitar a manutenção e extensibilidade:

### Estrutura de Arquivos

```
scripts/
├── main.js          # Ponto de entrada, integração com Foundry VTT
├── BlockEditor.js   # Classe principal do editor
└── constants.js     # Definições de blocos e constantes
```

### Responsabilidades

- **main.js**: Gerencia hooks do Foundry, configurações, comandos de chat e criação de diálogos
- **BlockEditor.js**: Contém toda a lógica do editor (drag & drop, geração de código, eventos)
- **constants.js**: Define blocos disponíveis, templates HTML e configurações

## Características

- 🧩 **Interface Visual**: Arraste e solte blocos para criar código
- 🎯 **Blocos Especializados**: Blocos para atributos, operadores, condicionais e mais
- 💻 **Geração de Código**: Converte a organização visual em código JavaScript
- 🔄 **Execução em Tempo Real**: Execute o código gerado diretamente no Foundry
- 📋 **Cópia Fácil**: Copie o código gerado para usar em outros lugares
- 🎨 **Interface Intuitiva**: Design limpo e responsivo
- 🔀 **Modo Fórmula**: Modo especial para comandos condicionais avançados

## Blocos Disponíveis

### Dados do Ator
- **Atributos**: Acessa `actor.system.attributes`
- **Spells**: Acessa `actor.system.spells` (prefixo `S:`)
- **Skills**: Acessa `actor.system.skills` (prefixo `Sk:`)
- **Costs**: Acessa `actor.system.currency` (prefixo `*Costs`)

### Propriedades
- **Label**: Obtém `.label` de um campo (sempre entre aspas)
- **Text**: Texto literal (sempre entre aspas)

### Operadores
- **Mod**: Modificador numérico (sem aspas)
- **Or**: Operador lógico OU (sempre gera `|`)

### Combate (Padrão SK)
- **Ranged**: Ataques à distância (prefixo `R:`)
- **Melee**: Ataques corpo a corpo (prefixo `M:`)
- **Weapon Damage**: Dano da arma (prefixo `D:` com aspas)
- **Parry**: Defesa aparar (prefixo `P:`)
- **Damage**: Valores de dano (sem prefixo)

### Condicionais (Apenas Modo Fórmula)
- **Check**: Inicia verificação (sempre gera `?`)
- **If**: Bloco condicional (sempre gera `/if`)
- **Else**: Bloco alternativo (sempre gera `/else`)
- **Line**: Separador de linha (sempre gera `/`)
- **Based**: Baseado em valor (prefixo `Based:`)

## Modos de Operação

### Modo Normal
- Gera código envolvido em colchetes: `[conteúdo]`
- Ideal para comandos simples
- Blind Roll disponível (adiciona prefixo `!`)

### Modo Fórmula
- Cada bloco é envolvido individualmente: `[bloco1] [bloco2]`
- Habilita blocos condicionais (If, Else, Line, Based)
- Desabilita Blind Roll automaticamente
- Ideal para comandos complexos como `/if [M:Spear] [D:"spear"]`

## Como Usar

1. **Abrir o Editor**: 
   - Use o comando `/blocks` ou `/editor` no chat
   - Pressione `Ctrl + B`
   - Clique no botão na barra de ferramentas (se disponível)

2. **Criar Código**:
   - Arraste blocos da paleta para a área de trabalho
   - Organize os blocos na ordem desejada
   - O código é gerado automaticamente conforme você edita

3. **Usar o Código**:
   - Copie o código gerado
   - Execute diretamente no Foundry (envia para o chat)
   - Use em macros ou outros scripts

## Exemplos de Uso

### Ataque Simples (Modo Normal)
```
Melee → Text("Spear")
```
Gera: `[M:Spear "Spear"]`

### Comando Condicional (Modo Fórmula)
```
If → Melee → Text("Spear") → Weapon Damage → Text("spear")
```
Gera: `/if [M:Spear] [D:"spear"]`

### Ataque com Dano (Modo Fórmula)
```
Melee → Text("Sword") → Line → Damage → Text("1d8+2")
```
Gera: `[M:Sword] / [1d8+2]`

### Teste com Blind Roll (Modo Normal)
```
Skills → Text("Athletics") (com Blind Roll ativado)
```
Gera: `[!Sk:Athletics]`

## Instalação

1. Baixe o módulo
2. Extraia na pasta `modules` do seu Foundry VTT
3. Ative o módulo nas configurações do mundo
4. Use os comandos `/blocks` ou `Ctrl + B` para abrir

## Configurações

- **Abrir automaticamente**: Abre o editor quando o mundo carrega
- **Blind Roll**: Adiciona prefixo `!` (desabilitado no Modo Fórmula)
- **Modo Fórmula**: Habilita blocos condicionais e formatação especial

## Comandos

- `/blocks` ou `/editor`: Abre o editor de blocos
- `Ctrl + B`: Atalho de teclado para abrir o editor

## Formatação Automática

### Prefixos Automáticos
- **Skills**: `Sk:valor` (sem espaço)
- **Spells**: `S: valor` (com espaço)
- **Costs**: `*Costs valor`
- **Ranged**: `R:valor` (sem espaço)
- **Melee**: `M:valor` (sem espaço)
- **Weapon Damage**: `D:"valor"` (com aspas, sem espaço)
- **Parry**: `P:valor` (sem espaço)
- **Based**: `Based:valor` (sem espaço)

### Aspas Automáticas
- **Label/Text**: Sempre entre aspas duplas
- **Weapon Damage**: Sempre entre aspas duplas

### Valores Fixos (Não Editáveis)
- **Or**: Sempre gera `|`
- **Check**: Sempre gera `?`
- **If**: Sempre gera `/if`
- **Else**: Sempre gera `/else`
- **Line**: Sempre gera `/`

## Desenvolvimento

### Estrutura de Classes

```javascript
// Classe principal do editor
class BlockEditor {
    constructor(html)           // Inicializa o editor
    _setupEventListeners()     // Configura eventos
    _addBlockToWorkspace()     // Adiciona bloco à área de trabalho
    _generateCode()            // Gera código automaticamente
    _formatBlockContent()      // Formata conteúdo dos blocos
    _toggleFormulaOnlyBlocks() // Controla visibilidade dos blocos
    // ... outros métodos
}
```

### Constantes Importantes

```javascript
// Blocos disponíveis com configurações
AVAILABLE_BLOCKS = { ... }

// Blocos visíveis apenas no Modo Fórmula
FORMULA_ONLY_BLOCKS = ['if', 'else', 'line', 'based']

// Blocos com conteúdo fixo (não editável)
READONLY_BLOCKS = ['or', 'check', 'if', 'else', 'line']
```

## Compatibilidade

- Foundry VTT v10+
- Testado até a versão 13
- Compatível com sistemas que usam padrão SK

## Suporte

Para dúvidas ou problemas:
1. Verifique o console do navegador para logs detalhados
2. Consulte esta documentação
3. Reporte bugs com informações do console

## Licença

Este módulo é distribuído sob licença MIT.