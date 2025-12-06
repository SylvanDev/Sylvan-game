use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("2ZruFMPznDSMcTry1X4JemNDrA284jiy7mjWV7LW77Aw");

#[program]
pub mod sylvan_new {
    use super::*;

    pub fn create_land_plot(ctx: Context<CreateLandPlot>) -> Result<()> {
        let land_plot = &mut ctx.accounts.land_plot;
        land_plot.owner = *ctx.accounts.player.key;
        land_plot.state = LandState::Dead;
        land_plot.fertility = 0;
        land_plot.last_harvest = 0;
        land_plot.bump = ctx.bumps.land_plot;

        msg!("New land plot created!");
        let price_in_lamports: u64 = 500_000_000;

        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.player.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            price_in_lamports,
        )?;

        Ok(())
    }

    pub fn revive_land_plot(ctx: Context<ReviveLandPlot>) -> Result<()> {
        let land_plot = &mut ctx.accounts.land_plot;
        require!(land_plot.owner == ctx.accounts.player.key(), SylvanError::NotOwner);
        require!(land_plot.state == LandState::Dead, SylvanError::NotDead);

        land_plot.state = LandState::ReadyToHarvest;
        land_plot.fertility = 100;
        msg!("Land plot revived by {}!", ctx.accounts.player.key());
        Ok(())
    }

    pub fn harvest(ctx: Context<Harvest>) -> Result<()> {
        require!(ctx.accounts.land_plot.owner == ctx.accounts.player.key(), SylvanError::NotOwner);
        require!(ctx.accounts.land_plot.state == LandState::ReadyToHarvest, SylvanError::NotReadyToHarvest);

        let amount_to_harvest = 100 * 1_000_000_000;

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.player_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        let seeds = &[
            b"vault".as_ref(),
            &[ctx.bumps.vault_authority],
        ];
        let signer = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_context, amount_to_harvest)?;

        msg!("Player {} harvested {} tokens!", ctx.accounts.player.key(), amount_to_harvest);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateLandPlot<'info> {
    #[account(init, payer = player, space = 8 + 32 + 1 + 1 + 8 + 1, seeds = [b"land", player.key().as_ref()], bump)]
    pub land_plot: Account<'info, LandPlot>,
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReviveLandPlot<'info> {
    #[account(
        mut,
        seeds = [b"land", player.key().as_ref()],
        bump = land_plot.bump
    )]
    pub land_plot: Account<'info, LandPlot>,
    #[account(mut)]
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct Harvest<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        mut,
        seeds = [b"land", player.key().as_ref()],
        bump = land_plot.bump
    )]
    pub land_plot: Account<'info, LandPlot>,

    #[account(mut)]
    pub syl_mint: Account<'info, Mint>, // ← исправлено: убран фиксированный адрес

    #[account(seeds = [b"vault"], bump)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub vault_authority: AccountInfo<'info>,

    #[account(
        mut,
        constraint = vault_token_account.owner == vault_authority.key(),
        constraint = vault_token_account.mint == syl_mint.key()
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = player_token_account.owner == player.key(),
        constraint = player_token_account.mint == syl_mint.key()
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct LandPlot {
    pub owner: Pubkey,
    pub state: LandState,
    pub fertility: u8,
    pub last_harvest: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum LandState {
    Dead,
    Growing,
    ReadyToHarvest,
}

#[error_code]
pub enum SylvanError {
    #[msg("You are not the owner of this land plot.")]
    NotOwner,
    #[msg("The land plot is not dead.")]
    NotDead,
    #[msg("The land plot is not ready to be harvested.")]
    NotReadyToHarvest,
}
