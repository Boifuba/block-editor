# Editor de Blocos - Foundry VTT

Um módulo para Foundry VTT que permite criar e organizar blocos de código visualmente através de uma interface drag-and-drop.

## Características

- 🧩 **Interface Visual**: Arraste e solte blocos para criar código
- 🎯 **Blocos Especializados**: Blocos para atributos, operadores, condicionais e mais
- 💻 **Geração de Código**: Converte a organização visual em código JavaScript
- 🔄 **Execução em Tempo Real**: Execute o código gerado diretamente no Foundry
- 📋 **Cópia Fácil**: Copie o código gerado para usar em outros lugares
- 🎨 **Interface Intuitiva**: Design limpo e responsivo

## Blocos Disponíveis

### Dados do Ator
- **Atributos**: Acessa `actor.system.attributes`
- **Spells**: Acessa `actor.system.spells`
- **Skills**: Acessa `actor.system.skills`
- **Costs**: Acessa `actor.system.currency`

### Propriedades
- **Value**: Obtém `.value` de um campo
- **Label**: Obtém `.label` de um campo
- **Text**: Texto literal `"texto"`

### Operadores
- **Equal**: Operador de igualdade `==`
- **Less**: Operador menor que `<`
- **Plus**: Operador de adição `+`
- **Or**: Operador lógico OU `||`

### Condicionais
- **Check**: Inicia verificação `if(`
- **If**: Bloco condicional `) {`
- **Else**: Bloco alternativo `} else {`

## Como Usar

1. **Abrir o Editor**: 
   - Clique no botão na barra de ferramentas
   - Use o comando `/blocks` no chat
   - Pressione `Ctrl + B`

2. **Criar Código**:
   - Arraste blocos da paleta para a área de trabalho
   - Organize os blocos na ordem desejada
   - Clique em "Gerar Código" para ver o resultado

3. **Usar o Código**:
   - Copie o código gerado
   - Execute diretamente no Foundry
   - Use em macros ou outros scripts

## Exemplos de Uso

### Verificar Atributo
```
Atributos → Value → Equal → Text("10") → Check → If
```
Gera: `if(actor.system.attributes.value == "10") {`

### Somar Valores
```
Atributos → Value → Plus → Skills → Value
```
Gera: `actor.system.attributes.value + actor.system.skills.value`

### Condição Complexa
```
Atributos → Value → Less → Text("5") → Or → Skills → Value → Equal → Text("0") → Check → If
```
Gera: `if(actor.system.attributes.value < "5" || actor.system.skills.value == "0") {`

## Instalação

1. Baixe o módulo
2. Extraia na pasta `modules` do seu Foundry VTT
3. Ative o módulo nas configurações do mundo
4. Use o botão na barra de ferramentas ou o comando `/blocks`

## Configurações

- **Abrir automaticamente**: Abre o editor quando o mundo carrega

## Comandos

- `/blocks` ou `/blocos`: Abre o editor de blocos
- `Ctrl + B`: Atalho de teclado para abrir o editor

## Compatibilidade

- Foundry VTT v10+
- Testado até a versão 11

## Suporte

Para dúvidas ou problemas, use o botão "Ajuda" no editor ou consulte a documentação.

## Licença

Este módulo é distribuído sob licença MIT.