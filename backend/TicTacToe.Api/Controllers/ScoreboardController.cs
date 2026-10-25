using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.DTOs;
using TicTacToe.Api.Models;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScoreboardController : ControllerBase
{
    private readonly IGameService _gameService;

    public ScoreboardController(IGameService gameService)
    {
        _gameService = gameService;
    }

    [HttpGet]
    public ActionResult<ScoreboardResponse> GetScoreboard()
    {
        var scoreboard = _gameService.GetScoreboard();
        var history = _gameService.GetScoreboardHistory();
        return Ok(new ScoreboardResponse
        {
            XWins = scoreboard.XWins,
            OWins = scoreboard.OWins,
            Draws = scoreboard.Draws,
            History = history
        });
    }

    [HttpPost("reset")]
    public ActionResult<ScoreboardResponse> ResetScoreboard()
    {
        var scoreboard = _gameService.ResetScoreboard();
        return Ok(new ScoreboardResponse
        {
            XWins = scoreboard.XWins,
            OWins = scoreboard.OWins,
            Draws = scoreboard.Draws,
            History = new List<RoundRecord>()
        });
    }

    [HttpGet("history")]
    public ActionResult<List<RoundRecord>> GetScoreboardHistory()
    {
        var history = _gameService.GetScoreboardHistory();
        return Ok(history);
    }
}
