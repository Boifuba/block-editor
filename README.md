# Editor de Blocos - Foundry VTT

Um módulo para Foundry VTT que permite criar e organizar blocos de código visualmente através de uma interface drag-and-drop.

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
- **Spells**: Acessa `actor.system.spells`
- **Skills**: Acessa `actor.system.skills`
- **Costs**: Acessa `actor.system.currency`

### Propriedades
- **Label**: Obtém `.label` de um campo
- **Text**: Texto literal `"texto"`

### Operadores
- **Mod**: Modificador numérico
- **Or**: Operador lógico OU `||`

### Combate (Padrão SK)
- **Ranged**: Ataques à distância `R:`
- **Melee**: Ataques corpo a corpo `M:`
- **Weapon Damage**: Dano da arma `D:"valor"`
- **Parry**: Defesa aparar `P:`
- **Damage**: Valores de dano

### Condicionais (Apenas Modo Fórmula)
- **Check**: Inicia verificação `?`
- **If**: Bloco condicional `/if`
- **Else**: Bloco alternativo `/else`
- **Line**: Separador de linha `/`
- **Based**: Baseado em valor `Based:`

## Modos de Operação

### Modo Normal
- Gera código envolvido em colchetes: `[conteúdo]`
- Ideal para comandos simples
- Blind Roll disponível

### Modo Fórmula
- Cada bloco é envolvido individualmente: `[bloco1] [bloco2]`
- Habilita blocos condicionais (If, Else, Line, Based)
- Desabilita Blind Roll automaticamente
- Ideal para comandos complexos como `/if [M:Spear] [D:"spear"]`

## Como Usar

1. **Abrir o Editor**: 
   - Clique no botão na barra de ferramentas
   - Use o comando `/blocks` no chat
   - Pressione `Ctrl + B`

2. **Criar Código**:
   - Arraste blocos da paleta para a área de trabalho
   - Organize os blocos na ordem desejada
   - O código é gerado automaticamente

3. **Usar o Código**:
   - Copie o código gerado
   - Execute diretamente no Foundry
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

## Instalação

1. Baixe o módulo
2. Extraia na pasta `modules` do seu Foundry VTT
3. Ative o módulo nas configurações do mundo
4. Use o botão na barra de ferramentas ou o comando `/blocks`

## Configurações

- **Abrir automaticamente**: Abre o editor quando o mundo carrega
- **Blind Roll**: Adiciona prefixo `!` (desabilitado no Modo Fórmula)
- **Modo Fórmula**: Habilita blocos condicionais e formatação especial

## Comandos

- `/blocks` ou `/editor`: Abre o editor de blocos
- `Ctrl + B`: Atalho de teclado para abrir o editor

## Formatação Automática

### Prefixos Automáticos
- **Skills**: `Sk:valor`
- **Spells**: `S: valor`
- **Costs**: `*Costs valor`
- **Ranged**: `R:valor`
- **Melee**: `M:valor`
- **Weapon Damage**: `D:"valor"` (com aspas)
- **Parry**: `P:valor`
- **Based**: `Based:valor`

### Aspas Automáticas
- **Label/Text**: Sempre entre aspas duplas
- **Weapon Damage**: Sempre entre aspas duplas

### Valores Fixos
- **Or**: Sempre gera `|`
- **Check**: Sempre gera `?`
- **If**: Sempre gera `/if`
- **Else**: Sempre gera `/else`
- **Line**: Sempre gera `/`

## Compatibilidade

- Foundry VTT v10+
- Testado até a versão 13

## Suporte

Para dúvidas ou problemas, use o botão "Ajuda" no editor ou consulte a documentação.

## Licença

Este módulo é distribuído sob licença MIT.