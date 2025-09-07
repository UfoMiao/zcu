#!/usr/bin/env node
/**
 * ZCU CLI Entry Point
 * zero-config claude-code undo - A regret medicine of Claude Code for u
 */

import process from 'node:process'
import chalk from 'chalk'
import { program } from 'commander'

import { handleCheckpoint } from './commands/checkpoint.js'
import { handleList } from './commands/list.js'
import { handleRedo } from './commands/redo.js'
import { handleRestore } from './commands/restore.js'
import { handleStatus } from './commands/status.js'
// 引入命令处理器
import { handleUndo } from './commands/undo.js'

// 设置程序基本信息
program
  .name('zcu')
  .description('zero-config claude-code undo - A regret medicine of Claude Code for u')
  .version('0.0.0')

// zcu undo - Undo the most recent operations
program
  .command('undo')
  .description('Undo the most recent operations')
  .option('-i, --interactive', 'Interactive selection of operations to undo')
  .option('-p, --preview', 'Preview what will be undone')
  .option('-f, --force', 'Force undo, skip confirmation')
  .action(handleUndo)

// zcu redo - Redo previously undone operations
program
  .command('redo')
  .description('Redo previously undone operations')
  .option('-i, --interactive', 'Interactive selection of operations to redo')
  .option('-p, --preview', 'Preview what will be redone')
  .option('-f, --force', 'Force redo, skip confirmation')
  .action(handleRedo)

// zcu cp - Create checkpoint
program
  .command('cp [name]')
  .alias('checkpoint')
  .description('Create a new checkpoint')
  .option('-d, --desc <description>', 'Checkpoint description')
  .option('-f, --force', 'Force create, overwrite existing checkpoint')
  .option('--untracked', 'Include untracked files')
  .action(handleCheckpoint)

// zcu list - List all checkpoints
program
  .command('list')
  .alias('ls')
  .description('List all available checkpoints')
  .option('-a, --all', 'Show all checkpoints (including deleted)')
  .option('-n, --limit <number>', 'Limit number of checkpoints to display', '10')
  .action(handleList)

// zcu restore - Restore to specific checkpoint
program
  .command('restore <name>')
  .description('Restore to a specific checkpoint')
  .option('-p, --preview', 'Preview what will be restored')
  .option('-f, --force', 'Force restore, skip confirmation')
  .action(handleRestore)

// zcu status - Show current status
program
  .command('status')
  .description('Show current workspace status')
  .option('-v, --verbose', 'Show detailed information')
  .action(handleStatus)

// Error handling
program.on('command:*', () => {
  console.error(chalk.red('Invalid command: %s'), program.args.join(' '))
  console.log(chalk.yellow('See --help for a list of available commands.'))
  process.exit(1)
})

// Parse command line arguments
program.parse()

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
