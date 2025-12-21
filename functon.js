// DOM Elements
        const codeInput = document.getElementById('codeInput');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const sampleBtn = document.getElementById('sampleBtn');
        const guideBtn = document.getElementById('guideBtn');
        const editorContainer = document.getElementById('editorContainer');
        const guideContainer = document.getElementById('guideContainer');
        const tokenTable = document.getElementById('tokenTable');
        const noTokensRow = document.getElementById('noTokensRow');
        const tokenCount = document.getElementById('tokenCount');
        const colorPreview = document.getElementById('colorPreview');
        
        // Token definitions
        const tokenTypes = {
            KEYWORD: 'keyword',
            IDENTIFIER: 'identifier',
            OPERATOR: 'operator',
            NUMBER: 'number',
            STRING: 'string',
            COMMENT: 'comment',
            PUNCTUATION: 'punctuation'
        };
        
        const keywords = ['int', 'float', 'double', 'char', 'if', 'else', 'for', 'while', 'return', 'void', 'main', 'print', 'string'];
        const operators = ['+', '-', '*', '/', '=', '>', '<', '>=', '<=', '==', '!=', '&&', '||'];
        const punctuation = ['(', ')', '{', '}', ';', ',', '[', ']'];
        
        // Event Listeners
        analyzeBtn.addEventListener('click', analyzeCode);
        clearBtn.addEventListener('click', clearAll);
        sampleBtn.addEventListener('click', loadSampleCode);
        guideBtn.addEventListener('click', toggleGuide);
        
        // Toggle between editor and guide
        function toggleGuide() {
            if (editorContainer.classList.contains('hidden')) {
                editorContainer.classList.remove('hidden');
                guideContainer.classList.add('hidden');
                guideBtn.classList.remove('text-blue-600', 'border-blue-600');
                guideBtn.classList.add('text-gray-500');
            } else {
                editorContainer.classList.add('hidden');
                guideContainer.classList.remove('hidden');
                guideBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
                guideBtn.classList.remove('text-gray-500');
            }
        }
        
        // Load sample code
        function loadSampleCode() {
            const sampleCode = `// Sample code for lexical analysis
int main() {
    int x = 10;
    float y = 3.14;
    string message = "Hello, World!";
    
    if (x > 5) {
        print(message);
    }
    
    return 0;
}`;
            codeInput.value = sampleCode;
            
            // Switch back to editor tab
            if (editorContainer.classList.contains('hidden')) {
                toggleGuide();
            }
        }
        
        // Clear all inputs and results
        function clearAll() {
            codeInput.value = '';
            clearResults();
            
            // Switch back to editor tab if needed
            if (editorContainer.classList.contains('hidden')) {
                toggleGuide();
            }
        }
        
        // Clear analysis results
        function clearResults() {
            tokenTable.innerHTML = '';
            tokenTable.appendChild(noTokensRow);
            tokenCount.textContent = '0';
            colorPreview.innerHTML = '<span class="text-gray-400">Preview will appear here after analysis...</span>';
        }
        
        // Main lexical analysis function
        function analyzeCode() {
            const code = codeInput.value;
            if (!code.trim()) {
                alert('Please enter some code to analyze.');
                return;
            }
            
            const tokens = tokenize(code);
            displayTokens(tokens);
            displayColorPreview(tokens);
        }
        
        // Tokenize the input code
        function tokenize(code) {
            const tokens = [];
            const lines = code.split('\n');
            
            for (let lineNum = 0; lineNum < lines.length; lineNum++) {
                const line = lines[lineNum];
                let i = 0;
                
                while (i < line.length) {
                    // Skip whitespace
                    if (/\s/.test(line[i])) {
                        i++;
                        continue;
                    }
                    
                    // Check for comments
                    if (line[i] === '/' && line[i+1] === '/') {
                        const comment = line.substring(i);
                        tokens.push({
                            type: tokenTypes.COMMENT,
                            value: comment,
                            line: lineNum + 1
                        });
                        break; // Rest of line is comment
                    }
                    
                    // Check for strings
                    if (line[i] === '"' || line[i] === "'") {
                        const quoteChar = line[i];
                        let j = i + 1;
                        while (j < line.length && line[j] !== quoteChar) {
                            j++;
                        }
                        const str = line.substring(i, j + 1);
                        tokens.push({
                            type: tokenTypes.STRING,
                            value: str,
                            line: lineNum + 1
                        });
                        i = j + 1;
                        continue;
                    }
                    
                    // Check for numbers
                    if (/\d/.test(line[i])) {
                        let j = i;
                        while (j < line.length && /[\d.]/.test(line[j])) {
                            j++;
                        }
                        const num = line.substring(i, j);
                        tokens.push({
                            type: tokenTypes.NUMBER,
                            value: num,
                            line: lineNum + 1
                        });
                        i = j;
                        continue;
                    }
                    
                    // Check for operators (including multi-character)
                    let foundOperator = false;
                    for (const op of operators) {
                        if (line.startsWith(op, i)) {
                            tokens.push({
                                type: tokenTypes.OPERATOR,
                                value: op,
                                line: lineNum + 1
                            });
                            i += op.length;
                            foundOperator = true;
                            break;
                        }
                    }
                    if (foundOperator) continue;
                    
                    // Check for punctuation
                    if (punctuation.includes(line[i])) {
                        tokens.push({
                            type: tokenTypes.PUNCTUATION,
                            value: line[i],
                            line: lineNum + 1
                        });
                        i++;
                        continue;
                    }
                    
                    // Check for identifiers and keywords
                    if (/[a-zA-Z_]/.test(line[i])) {
                        let j = i;
                        while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) {
                            j++;
                        }
                        const word = line.substring(i, j);
                        
                        const type = keywords.includes(word) ? tokenTypes.KEYWORD : tokenTypes.IDENTIFIER;
                        
                        tokens.push({
                            type: type,
                            value: word,
                            line: lineNum + 1
                        });
                        i = j;
                        continue;
                    }
                    
                    // If nothing matched, treat as unknown/identifier
                    tokens.push({
                        type: tokenTypes.IDENTIFIER,
                        value: line[i],
                        line: lineNum + 1
                    });
                    i++;
                }
            }
            
            return tokens;
        }
        
        // Display tokens in the table
        function displayTokens(tokens) {
            // Clear previous results
            tokenTable.innerHTML = '';
            
            if (tokens.length === 0) {
                tokenTable.appendChild(noTokensRow);
                tokenCount.textContent = '0';
                return;
            }
            
            // Update token count
            tokenCount.textContent = tokens.length;
            
            // Add each token to the table
            tokens.forEach((token, index) => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                
                // Get CSS class for token type
                const typeClass = `token-type-${token.type}`;
                
                row.innerHTML = `
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${index + 1}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-mono font-medium">${escapeHtml(token.value)}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${typeClass}">${token.type}</span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">"${escapeHtml(token.value)}"</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${token.line}</td>
                `;
                
                tokenTable.appendChild(row);
            });
        }
        
        // Display color-coded preview
        function displayColorPreview(tokens) {
            if (tokens.length === 0) {
                colorPreview.innerHTML = '<span class="text-gray-400">No code to preview.</span>';
                return;
            }
            
            let previewHTML = '';
            let currentLine = 1;
            
            tokens.forEach(token => {
                // Add line breaks when line changes
                if (token.line > currentLine) {
                    for (let i = currentLine; i < token.line; i++) {
                        previewHTML += '\n';
                    }
                    currentLine = token.line;
                }
                
                // Add token with appropriate CSS class
                const cssClass = `code-${token.type}`;
                previewHTML += `<span class="${cssClass}">${escapeHtml(token.value)}</span> `;
            });
            
            colorPreview.innerHTML = previewHTML;
        }
        
        // Utility function to escape HTML
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Initialize with sample code
        document.addEventListener('DOMContentLoaded', () => {
            loadSampleCode();
            analyzeCode();
        });