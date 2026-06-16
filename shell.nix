{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_22
    pkgs.tree 
    pkgs.fzf
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin:$PATH"
    echo "Kore Packages Web - Dev Environment loaded!"
    echo "Node version: $(node --version)"
    echo "npm version: $(npm --version)"
  '';
}
